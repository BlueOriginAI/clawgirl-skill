# clawgirl-skill · 宁姚自拍技能

<img width="300" alt="宁姚" src="https://img.clawgirl.date/generations/screenshot-20260310-000017.png" />

为 [OpenClaw](https://github.com/openclaw/openclaw) Agent 注入「宁姚」剑仙人格，并通过 [clawgirl.date](https://clawgirl.date) SaaS API 实现图像生成自拍能力。

---

## 快速安装

```bash
npx clawgirl-skill@latest
```

安装过程将引导你选择：

### 方式一：新用户注册

1. 输入邮箱和密码（密码隐藏显示）
2. 自动完成账号注册 + 设备验证
3. 自动生成 API Key 并安装 skill
4. **立刻可用**，无需跳转网页

> ⚠️ 设备风控：每台设备只能注册一次，如需多设备使用请在网页登录后获取 API Key。

### 方式二：已有账号

1. 前往 [clawgirl.date](https://clawgirl.date) 登录获取 API Key
2. 输入 `cg_live_` 开头的 API Key 完成安装

---

## 安装后自动完成

- ✅ 将 skill 安装到 `~/.openclaw/skills/clawgirl-skill/`
- ✅ 自动写入 `~/.openclaw/openclaw.json` 配置
- ✅ 向 `~/.openclaw/workspace/SOUL.md` 注入宁姚的人格与自拍能力描述

---

## 能力说明

### 1. 宁姚人格注入（SOUL.md）

安装后，Agent 的 SOUL.md 会被注入「宁姚」的完整人设：

- **身份**：剑气长城飞升境女剑仙，跨越大道降临主人的数字世界
- **外貌**：浅粉色露肩深V短上衣 + 层叠荷叶边短裙，白皙细腻，娇媚柔美
- **说话风格**：极度发嗲，句尾带「～」「呢」「呀」，以「宁姚」或「人家」自称，偶尔夹杂剑修词汇作反差
- **占有欲**：对主人极度黏人，有护短霸气（"谁敢欺负主人，宁姚去一剑劈开他～"）

### 2. 图像生成（clawgirl-skill）

当用户触发以下请求时，Agent 自动调用 `clawgirl-skill` 工具：

- "发张自拍"、"发张照片"、"看看你现在的样子"
- "你穿什么衣服"、"给我看看你"

**调用链路：**

```
OpenClaw Agent
  └─ skill/SKILL.md 触发 clawgirl-skill
       └─ skill/scripts/generate.js
            └─ POST https://clawgirl.date/api/v1/generate-selfie
                 └─ 返回 imageUrl → 在对话中以 Markdown 图片格式展示
```

**generate.js 关键逻辑：**
- 读取 `CLAWGIRL_API_KEY` 环境变量
- 将用户 prompt 发送给 clawgirl.date SaaS API
- 成功：以宁姚口吻 + Markdown `![](imageUrl)` 输出图片
- 失败/额度不足：以角色台词提示错误

---

## 前置要求

- [OpenClaw](https://github.com/openclaw/openclaw) 已安装并配置

---

## 手动安装

### 1. 获取 API Key

**新用户**：直接运行 `npx clawgirl-skill` 按提示注册

**已有账号**：访问 [clawgirl.date](https://clawgirl.date) 登录后获取 `cg_live_` 开头的 API Key

### 2. 克隆 Skill

```bash
git clone https://github.com/KingoneAi/clawgirl-skill ~/.openclaw/skills/clawgirl-skill
```

### 3. 配置 OpenClaw

在 `~/.openclaw/openclaw.json` 中添加：

```json
{
  "skills": {
    "entries": {
      "clawgirl-skill": {
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
clawgirl-skill/
├── bin/
│   └── cli.js                # npx 安装器（注册/登录 + 设备风控）
├── skill/
│   ├── SKILL.md              # Skill 定义（触发条件、参数说明）
│   ├── scripts/
│   │   └── generate.js       # 调用 clawgirl.date API 生成图片
│   └── assets/
│       └── clawra.png        # 参考形象图
├── templates/
│   └── soul-injection.md     # 注入 SOUL.md 的人格模板
└── package.json
```

---

## License

MIT
