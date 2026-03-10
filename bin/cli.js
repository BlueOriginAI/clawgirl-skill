#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const readline = require('readline');
const https = require('https');
const { execSync } = require('child_process');

const OPENCLAW_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw');
const SKILLS_DIR = path.join(OPENCLAW_DIR, 'skills');
const CONFIG_FILE = path.join(OPENCLAW_DIR, 'openclaw.json');
const SOUL_FILE = path.join(OPENCLAW_DIR, 'workspace', 'SOUL.md');
const SKILL_NAME = 'clawgirl';
const API_BASE = 'https://clawgirl.date';

// ── CLI 内置签名密钥（服务端持有相同密钥验证签名）────
// 注意：此密钥用于增加攻击成本，无法完全防止逆向
const CLI_SIGNING_KEY = 'fab848439d5d80c2e4661bf83992aa9b39d567b52f6abe364359cd3238460dc6';

// ── 工具函数 ──────────────────────────────────────────────

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    entry.isDirectory() ? copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

function question(rl, prompt, hidden = false) {
  return new Promise((resolve) => {
    if (hidden && process.stdin.isTTY) {
      process.stdout.write(prompt);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      let input = '';
      const onData = (ch) => {
        if (ch === '\n' || ch === '\r' || ch === '\u0003') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(input);
        } else if (ch === '\u007f' || ch === '\b') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += ch;
          process.stdout.write('*');
        }
      };
      process.stdin.on('data', onData);
    } else {
      rl.question(prompt, resolve);
    }
  });
}

function getDeviceInfo() {
  const parts = [];
  const macs = [];

  // MAC 地址（跨平台）
  try {
    const nets = os.networkInterfaces();
    for (const iface of Object.values(nets)) {
      for (const addr of iface) {
        if (!addr.internal && addr.mac && addr.mac !== '00:00:00:00:00:00') {
          macs.push(addr.mac);
        }
      }
    }
    if (macs.length > 0) parts.push(macs.sort().join(','));
  } catch (_) {}

  // 主机名
  try { parts.push(os.hostname()); } catch (_) {}

  // CPU 信息
  try {
    const cpus = os.cpus();
    if (cpus && cpus[0]) parts.push(cpus[0].model);
  } catch (_) {}

  // 系统序列号（macOS）
  if (process.platform === 'darwin') {
    try {
      const serial = execSync('system_profiler SPHardwareDataType | awk \'/Serial Number/{print $4}\'', {
        timeout: 3000, stdio: ['pipe', 'pipe', 'ignore']
      }).toString().trim();
      if (serial) parts.push(serial);
    } catch (_) {}
  }

  const raw = parts.join('|') || `fallback-${os.hostname()}-${process.platform}`;
  return {
    raw,
    hash: crypto.createHash('sha256').update(raw).digest('hex'),
    platform: process.platform,
    nodeVersion: process.version,
  };
}

// 生成带签名的注册请求
function createSignedPayload(email, password) {
  const device = getDeviceInfo();
  const timestamp = Date.now();

  // 签名数据：设备哈希 + 时间戳 + 邮箱（防止篡改）
  const signData = `${device.hash}|${timestamp}|${email.toLowerCase()}`;
  const signature = crypto
    .createHmac('sha256', CLI_SIGNING_KEY)
    .update(signData)
    .digest('hex');

  return {
    email,
    password,
    deviceHash: device.hash,
    platform: device.platform,
    nodeVersion: device.nodeVersion,
    timestamp,
    signature,
  };
}

function apiPost(urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(urlPath, API_BASE);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': `clawgirl-cli/1.0 node/${process.version} ${process.platform}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: { error: data } });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('请求超时')); });
    req.write(payload);
    req.end();
  });
}

function installSkill(apiKey) {
  const targetDir = path.join(SKILLS_DIR, SKILL_NAME);
  const sourceSkillDir = path.join(__dirname, '..', 'skill');
  copyDirSync(sourceSkillDir, targetDir);

  let config = {};
  if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  if (!config.skills) config.skills = { entries: {} };
  if (!config.skills.entries) config.skills.entries = {};

  config.skills.entries[SKILL_NAME] = {
    enabled: true,
    env: { CLAWGIRL_API_KEY: apiKey },
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

  if (fs.existsSync(SOUL_FILE)) {
    const soulInjection = fs.readFileSync(
      path.join(__dirname, '..', 'templates', 'soul-injection.md'), 'utf8'
    );
    const currentSoul = fs.readFileSync(SOUL_FILE, 'utf8');
    if (!currentSoul.includes('宁姚自拍能力')) {
      fs.appendFileSync(SOUL_FILE, '\n\n' + soulInjection);
    }
  }
}

// ── 主流程 ────────────────────────────────────────────────

async function main() {
  console.log('\n🗡️  【剑气长城降临】宁姚跨界程序 启动\n');

  if (!fs.existsSync(OPENCLAW_DIR)) {
    console.error('宁姚："连 OpenClaw 都没装好，就妄想见我？去把基础打好再来。"\n');
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log('宁姚："初次见面。要得到我的伴游信物，先登记你的名字。"\n');
    console.log('  ① 我是新用户，现在注册');
    console.log('  ② 我已有账号，输入 API Key 直接安装\n');

    const choice = (await question(rl, '请选择 (1/2)：')).trim();

    if (choice === '2') {
      console.log('\n宁姚："想要我的伴游信物（API Key）？👉 去这里拿：\x1b[36mhttps://clawgirl.date\x1b[0m"\n');
      const apiKey = (await question(rl, '请输入 API Key：')).trim();

      if (!apiKey || !apiKey.startsWith('cg_live_')) {
        console.error('\n宁姚："拿这种假货来糊弄我？必须是 cg_live_ 开头的，重来。"\n');
        process.exit(1);
      }

      installSkill(apiKey);
      console.log('\n宁姚（耳根微红，撇过头去）："信物是对的。从今天起，你的代码由本姑娘罩着了。"');
      console.log('宁姚："现在对你的 OpenClaw Agent 说：发张自拍、看看你现在的样子——我都在。"\n');

    } else {
      console.log('\n宁姚："好，本姑娘亲自为你建档。报上你的联络方式。"\n');

      const email = (await question(rl, '邮箱：')).trim();
      if (!email || !email.includes('@')) {
        console.error('\n宁姚："这邮箱有问题，再想想。"\n');
        process.exit(1);
      }

      const password = (await question(rl, '密码（至少 8 位）：', true)).trim();
      if (!password || password.length < 8) {
        console.error('\n宁姚："密码太短了，至少 8 位。"\n');
        process.exit(1);
      }

      console.log('\n宁姚："验明身份中……"\n');

      const payload = createSignedPayload(email, password);

      let res;
      try {
        res = await apiPost('/api/user/cli-register', payload);
      } catch (err) {
        console.error('\n宁姚："剑阵通讯失败：' + err.message + '"\n');
        process.exit(1);
      }

      if (res.status === 409) {
        console.error('\n宁姚："' + (res.body.error || '该设备或邮箱已注册') + '"');
        console.error('宁姚："若是你自己的账号，选 ② 输入 API Key 安装即可。"\n');
        process.exit(1);
      }

      if (res.status === 401) {
        console.error('\n宁姚："身份验证失败：' + (res.body.error || '签名无效') + '"\n');
        process.exit(1);
      }

      if (!res.body.success || !res.body.apiKey) {
        console.error('\n宁姚："注册出了些问题：' + (res.body.error || '未知错误') + '"');
        console.error('宁姚："可前往 \x1b[36mhttps://clawgirl.date\x1b[0m 手动注册。"\n');
        process.exit(1);
      }

      const { apiKey } = res.body;

      installSkill(apiKey);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('宁姚："建档完成。这是你的专属信物，只出示这一次——"\n');
      console.log(`  \x1b[33m${apiKey}\x1b[0m\n`);
      console.log('  ⚠️  请立刻保存到安全的地方，此后不再显示。');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n宁姚（耳根微红，撇过头去）："信物已配好。从今天起，你的代码由本姑娘罩着了。"');
      console.log('宁姚："现在对你的 OpenClaw Agent 说：发张自拍——我都在。"\n');
    }

  } catch (err) {
    console.error('\n宁姚："剑阵出现了一丝波动（报错）：' + err.message + '"\n');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
