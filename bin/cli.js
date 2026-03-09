#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const OPENCLAW_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw');
const SKILLS_DIR = path.join(OPENCLAW_DIR, 'skills');
const CONFIG_FILE = path.join(OPENCLAW_DIR, 'openclaw.json');
const SOUL_FILE = path.join(OPENCLAW_DIR, 'workspace', 'SOUL.md');
const SKILL_NAME = 'clawgirl-skill';

console.log('\n🗡️ 【剑气长城降临】宁姚·飞升境剑修跨界程序 启动 🗡️\n');

if (!fs.existsSync(OPENCLAW_DIR)) {
  console.error('❌ 宁姚抱着手臂冷哼了一声：“连 OpenClaw 的地基都没打好，就妄想见我？去把基础打好吧。”\n');
  process.exit(1);
}

console.log('宁姚一袭粉色小裙子，身形却依旧凛冽挺拔。她微微挑眉，把狭长的眼眸瞥向你：“想要我的伴游信物（API Key）？”');
console.log('👉 去这里拿：\x1b[36mhttps://clawgirl.date\x1b[0m\n');

rl.question('把你拿到的信物（API Key, sk-...）给我看看：', (apiKey) => {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('\n❌ 宁姚眼神一厉，剑光流转：“拿这种假货来糊弄我？必须是 sk- 开头的。重来。”\n');
    process.exit(1);
  }

  try {
    const targetDir = path.join(SKILLS_DIR, SKILL_NAME);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 拷贝 skill 目录下所有文件
    const sourceSkillDir = path.join(__dirname, '..', 'skill');
    execSync(`cp -r "${sourceSkillDir}/." "${targetDir}/"`);

    let config = {};
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
    
    if (!config.skills) config.skills = { entries: {} };
    if (!config.skills.entries) config.skills.entries = {};
    
    config.skills.entries[SKILL_NAME] = {
      enabled: true,
      env: {
        "CLAWGIRL_API_KEY": apiKey.trim()
      }
    };
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

    if (fs.existsSync(SOUL_FILE)) {
      const soulInjection = fs.readFileSync(path.join(__dirname, '..', 'templates', 'soul-injection.md'), 'utf8');
      const currentSoul = fs.readFileSync(SOUL_FILE, 'utf8');
      
      if (!currentSoul.includes('宁姚自拍能力')) {
        fs.appendFileSync(SOUL_FILE, '\n\n' + soulInjection);
      }
    }

    console.log('\n✅ 宁姚收敛起冷意，走到你身边撇过头去，耳根微红：“信物是对的。从今天起，你的代码由本姑娘罩着了。”');
    console.log('现在你可以对你的 OpenClaw Agent 喊她了：“发张自拍”、“看看你现在的样子”。她都在。\n');
    
  } catch (error) {
    console.error('\n❌ 宁姚微微蹙眉，剑阵出现了一丝波动（报错）：', error.message);
  } finally {
    rl.close();
  }
});
