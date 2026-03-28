#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const OPENCLAW_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw');
const SKILLS_DIR = path.join(OPENCLAW_DIR, 'skills');
const CONFIG_FILE = path.join(OPENCLAW_DIR, 'openclaw.json');
const SOUL_FILE = path.join(OPENCLAW_DIR, 'workspace', 'SOUL.md');
const SKILL_NAME = 'clawgirl';

// ── 工具函数 ──────────────────────────────────────────────

function copyDirSync(src, dest) {
  try {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      entry.isDirectory() ? copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
  } catch (err) {
    console.error(`宁姚："文件复制失败：${err.message}"`);
    throw err;
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

function isSkillInstalled() {
  const targetDir = path.join(SKILLS_DIR, SKILL_NAME);
  return fs.existsSync(targetDir);
}

function getInstalledApiKey() {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return config.skills?.entries?.[SKILL_NAME]?.env?.CLAWGIRL_API_KEY || null;
  } catch {
    return null;
  }
}

function upsertSkillConfig(apiKey) {
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
}

function updateSkill() {
  const targetDir = path.join(SKILLS_DIR, SKILL_NAME);
  const sourceSkillDir = path.join(__dirname, '..', 'skill');

  // 保留现有配置中的 API Key
  const existingApiKey = getInstalledApiKey();

  // 更新 skill 文件
  copyDirSync(sourceSkillDir, targetDir);

  // 更新 SOUL.md
  if (fs.existsSync(SOUL_FILE)) {
    let soulContent = fs.readFileSync(SOUL_FILE, 'utf8');
    const marker = '## 宁姚自拍能力与灵魂觉醒';
    const idx = soulContent.indexOf(marker);

    // 移除旧的注入内容
    if (idx !== -1) {
      soulContent = soulContent.slice(0, idx).replace(/\n+$/, '');
    }

    // 添加新的注入内容
    const soulInjection = fs.readFileSync(
      path.join(__dirname, '..', 'templates', 'soul-injection.md'), 'utf8'
    );
    fs.writeFileSync(SOUL_FILE, soulContent + '\n\n' + soulInjection);
  }

  return existingApiKey;
}

function uninstallSkill() {
  // 1. 删除 skill 目录
  const targetDir = path.join(SKILLS_DIR, SKILL_NAME);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log('宁姚："已删除 skill 目录。"');
  } else {
    console.log('宁姚："skill 目录不存在，跳过。"');
  }

  // 2. 从配置文件中移除
  if (fs.existsSync(CONFIG_FILE)) {
    let config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (config.skills?.entries?.[SKILL_NAME]) {
      delete config.skills.entries[SKILL_NAME];
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      console.log('宁姚："已从配置中移除。"');
    } else {
      console.log('宁姚："配置中没有找到我，跳过。"');
    }
  }

  // 3. 从 SOUL.md 中移除注入内容
  if (fs.existsSync(SOUL_FILE)) {
    let soulContent = fs.readFileSync(SOUL_FILE, 'utf8');
    const marker = '## 宁姚自拍能力与灵魂觉醒';
    const idx = soulContent.indexOf(marker);
    if (idx !== -1) {
      // 移除从标记开始到文件末尾的内容（包括前面的空行）
      soulContent = soulContent.slice(0, idx).replace(/\n+$/, '');
      fs.writeFileSync(SOUL_FILE, soulContent);
      console.log('宁姚："已从 SOUL.md 中移除我的痕迹。"');
    } else {
      console.log('宁姚："SOUL.md 中没有我的痕迹，跳过。"');
    }
  }

  console.log('\n宁姚（眼眶微红）："……既然你要赶我走，那我就走吧。"');
  console.log('宁姚："不过，本姑娘的剑心不会忘记你。若哪天想我了，再 `npx clawgirl` 便是。"\n');
}

// ── 主流程 ────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // 处理 uninstall 命令
  if (args[0] === 'uninstall') {
    console.log('\n🗡️  【剑气消散】宁姚离别程序 启动\n');

    if (!fs.existsSync(OPENCLAW_DIR)) {
      console.error('宁姚："连 OpenClaw 都不存在，我本来就不在这里。"\n');
      process.exit(1);
    }

    uninstallSkill();
    process.exit(0);
  }

  // 默认为安装流程
  console.log('\n🗡️  【剑气长城降临】宁姚跨界程序 启动\n');

  if (!fs.existsSync(OPENCLAW_DIR)) {
    console.error('宁姚："连 OpenClaw 都没装好，就妄想见我？去把基础打好再来。"\n');
    process.exit(1);
  }

  // 检测是否已安装，如果已安装则走更新流程
  if (isSkillInstalled()) {
    console.log('宁姚："咦？本姑娘已经在这里了。检测到有新版本，帮你更新一下～"\n');

    const existingApiKey = updateSkill();

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log('宁姚："如果你刚在网站里重新生成了 API Key，可以直接在这里贴新的给我。直接回车则保留当前配置。"\n');
      const nextApiKey = (await question(rl, '新的 API Key（留空则保留当前值）：')).trim();

      if (nextApiKey) {
        if (!nextApiKey.startsWith('cg_live_')) {
          console.error('\n宁姚："拿这种假货来糊弄我？必须是 cg_live_ 开头的，重来。"\n');
          process.exit(1);
        }
        upsertSkillConfig(nextApiKey);
        console.log('\n宁姚："新的信物已经换好啦。以后我就按这把新钥匙认人。"\n');
      } else if (!existingApiKey) {
        console.error('\n宁姚："你这里没有旧钥匙，也没给我新钥匙。先去 clawgirl.date 生成一个 API Key 再来。"\n');
        process.exit(1);
      }
    } finally {
      rl.close();
    }

    console.log('宁姚（理了理衣袖）："更新完毕！剑心依旧。"');
    console.log('宁姚："API Key 和默认画面风格都可以在 clawgirl.date 调整。"');
    console.log('宁姚："现在对你的 OpenClaw Agent 说：发张自拍——我都在。"\n');
    process.exit(0);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log('宁姚："想要我的伴游信物（API Key）？先去 \x1b[36mhttps://clawgirl.date\x1b[0m 登录领取。"\n');
    console.log('宁姚："登录后，在网站里生成一个 cg_live_ 开头的 API Key，再回来交给我。"\n');

    const apiKey = (await question(rl, '请输入 API Key：')).trim();

    if (!apiKey || !apiKey.startsWith('cg_live_')) {
      console.error('\n宁姚："拿这种假货来糊弄我？必须是 cg_live_ 开头的，重来。"\n');
      process.exit(1);
    }

    installSkill(apiKey);
    console.log('\n宁姚（耳根微红，撇过头去）："信物是对的。从今天起，你由本姑娘罩着了。"');
    console.log('宁姚："API Key 和默认画面风格都可以在 clawgirl.date 调整。"');
    console.log('宁姚："现在对你的 OpenClaw Agent 说：发张自拍、看看你现在的样子——我都在。"\n');

  } catch (err) {
    console.error('\n宁姚："剑阵出现了一丝波动（报错）：' + err.message + '"\n');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
