# clawgirl · 宁姚自拍技能

<img width="300" alt="宁姚" src="https://img.clawgirl.date/generations/screenshot-20260310-000017.png" />

为 [OpenClaw](https://github.com/openclaw/openclaw) Agent 注入「宁姚」剑仙人格，并通过 [clawgirl.date](https://clawgirl.date) SaaS API 实现图像生成自拍能力。

---

## 快速安装

```bash
npx clawgirl@latest
```

安装过程如下：

1. 前往 [clawgirl.date](https://clawgirl.date) 登录
2. 在网站内生成 `cg_live_` 开头的 API Key
3. 运行 `npx clawgirl@latest`
4. 输入 API Key 完成安装

如果你已经安装过 skill，但后来在网站里重新生成了 API Key：

1. 再次运行 `npx clawgirl@latest`
2. 按提示粘贴新的 `cg_live_` API Key
3. 安装器会保留 skill 文件并更新本地配置中的密钥

---

## 安装后自动完成

- ✅ 将 skill 安装到 `~/.openclaw/skills/clawgirl/`
- ✅ 自动写入 `~/.openclaw/openclaw.json` 配置
- ✅ 向 `~/.openclaw/workspace/SOUL.md` 注入宁姚的人格与自拍能力描述

---

## 能力说明

### 1. 宁姚人格注入（SOUL.md）

安装后，Agent 的 SOUL.md 会被注入「宁姚」的完整人设：

- **身份**：剑气长城飞升境女剑仙，跨越大道降临主人的数字世界
- **外貌**：优雅的传统中式仙侠服饰，冰白色高领上衣配层叠飘逸的裙摆，剑仙气质不改
- **说话风格**：活泼可爱，保留着剑修那股"本命飞剑护短"的劲儿，语气俏皮灵动，爱撒娇，句尾常带着"～"、"呢"、"呀"。性格开朗活泼，有点小傲娇，对主人很黏人
- **剑仙专属梗**：偶尔用剑修词汇打趣，比如"谁敢欺负主人，宁姚帮你一剑劈开他～"、"哼，本姑娘的飞剑可是认人的～"

### 2. 图像生成（clawgirl）

当用户触发以下请求时，Agent 自动调用 `clawgirl` 工具：

- "发张自拍"、"发张照片"、"看看你现在的样子"
- "你穿什么衣服"、"给我看看你"
- "脱掉衣服"、"全脱"、"裸体"、"换衣服"、"穿回衣服"

**调用链路：**

```
OpenClaw Agent
  └─ skill/SKILL.md 触发 clawgirl
       └─ skill/scripts/generate.js
            └─ POST https://clawgirl.date/api/v1/chat
                 ├─ 命中生图：返回 imageUrl → 下载到本地后发送图片
                 └─ 未命中生图：返回 response → 原样回复文本
```

**generate.js 关键逻辑：**
- 读取 `CLAWGIRL_API_KEY` 环境变量
- 将用户原始请求发送给 clawgirl.date SaaS API
- 命中生图：输出 `IMAGE_PATH=...`，下载失败时降级为 `IMAGE_URL=...`
- 未命中生图：输出 `TEXT_RESPONSE_BASE64=...`，由 OpenClaw 原样回复接口文本
- 失败/额度不足：以角色台词提示错误

---

## 前置要求

- [OpenClaw](https://github.com/openclaw/openclaw) 已安装并配置

---

## 手动安装

### 1. 获取 API Key

访问 [clawgirl.date](https://clawgirl.date) 登录后获取 `cg_live_` 开头的 API Key

如果已安装过 skill 且只是更换 API Key，也可以直接重新运行 `npx clawgirl@latest`，按提示覆盖本地配置。

### 2. 克隆 Skill

```bash
git clone https://github.com/KingoneAi/clawgirl ~/.openclaw/skills/clawgirl
```

### 3. 配置 OpenClaw

在 `~/.openclaw/openclaw.json` 中添加：

```json
{
  "skills": {
    "entries": {
      "clawgirl": {
        "enabled": true,
        "env": {
          "CLAWGIRL_API_KEY": "cg_live_your_key_here"
        }
      }
    }
  }
}
```

### 4. 注入 SOUL.md

将 `templates/soul-injection.md` 的内容追加到 `~/.openclaw/workspace/SOUL.md`。

---

## 使用示例

安装后，对你的 OpenClaw Agent 说：

```
"发张自拍"
"看看你现在穿什么"
"给我看看你在哪里"
"发张你在咖啡馆的照片"
```

---

## 项目结构

```
clawgirl/
├── bin/
│   └── cli.js                # npx 安装器（提示登录网站并输入 API Key）
├── skill/
│   ├── SKILL.md              # Skill 定义（触发条件、参数说明）
│   ├── scripts/
│   │   └── generate.js       # 调用 clawgirl.date API，返回图片或文本响应
│   └── assets/
│       └── clawgirl.jpeg     # 参考形象图
├── templates/
│   └── soul-injection.md     # 注入 SOUL.md 的人格模板
└── package.json
```

---

## License

MIT
