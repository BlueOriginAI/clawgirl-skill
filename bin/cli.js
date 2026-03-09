#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const OPENCLAW_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw');
const SKILLS_DIR = path.join(OPENCLAW_DIR, 'skills');
const CONFIG_FILE = path.join(OPENCLAW_DIR, 'openclaw.json');
const SOUL_FILE = path.join(OPENCLAW_DIR, 'workspace', 'SOUL.md');
const SKILL_NAME = 'clawgirl-skill';

// 跨平台递归拷贝目录
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('\n🗡️  【剑气长城降临】宁姚跨界程序 启动\n');

if (!fs.existsSync(OPENCLAW_DIR)) {
  console.error('宁姚："连 OpenClaw 都没装好，就妄想见我？去把基础打好再来。"\n');
  process.exit(1);
}

console.log('宁姚："想要我的伴游信物（API Key）？👉 去这里拿：\x1b[36mhttps://clawgirl.date\x1b[0m"\n');

rl.question('你：', (apiKey) => {
  apiKey = (apiKey || '').trim();

  if (!apiKey || !apiKey.startsWith('cg_live_')) {
    console.error('\n宁姚："拿这种假货来糊弄我？必须是 cg_live_ 开头的，重来。"\n');
    rl.close();
    process.exit(1);
  }

  try {
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
      env: {
        CLAWGIRL_API_KEY: apiKey,
      },
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

    if (fs.existsSync(SOUL_FILE)) {
      const soulInjection = fs.readFileSync(
        path.join(__dirname, '..', 'templates', 'soul-injection.md'),
        'utf8'
      );
      const currentSoul = fs.readFileSync(SOUL_FILE, 'utf8');
      if (!currentSoul.includes('宁姚自拍能力')) {
        fs.appendFileSync(SOUL_FILE, '\n\n' + soulInjection);
      }
    }

    console.log('\n宁姚（耳根微红，撇过头去）："信物是对的。从今天起，你的代码由本姑娘罩着了。"');
    console.log('宁姚："现在对你的 OpenClaw Agent 说：发张自拍、看看你现在的样子——我都在。"\n');

  } catch (error) {
    console.error('\n宁姚："剑阵出现了一丝波动（报错）：' + error.message + '"\n');
  } finally {
    rl.close();
  }
});
