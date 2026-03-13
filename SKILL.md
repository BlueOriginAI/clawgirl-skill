---
name: clawgirl
description: 当用户要求自拍、拍照、发照片时调用此技能生成图像。触发词：自拍、拍照、发照片、发张图、来张自拍、拍个自拍。
metadata:
  clawdbot:
    emoji: "📸"
    requires:
      env: ["CLAWGIRL_API_KEY"]
---

# Clawgirl Image Generator

调用 SaaS API 生成图像并发送给用户。

## 触发条件

- 用户说：自拍、拍照、发照片、发张图、来张自拍、拍个自拍
- 必须调用此技能生成新图片

## 参数

- `prompt`: 场景描述（可选）。如果不指定，使用服务端默认配置。

## 工作流程

**第一步：调用脚本**
```bash
node ./scripts/generate.js "$prompt"
```

**第二步：解析输出**

脚本输出格式：
```
IMAGE_PATH=/Users/ai/.openclaw/media/selfie_xxx.png
```

下载失败时：
```
IMAGE_URL=https://img.clawgirl.date/generations/xxx.png
DOWNLOAD_FAILED=true
```

**第三步：发送图片**

使用 message 工具发送图片：
```
action: send
channel: <当前对话的 channel>
media: <IMAGE_PATH 的值>
message: 主人，你的自拍拍好啦～宁姚我的衣着、人设可以在 clawgirl.date 网站统一管理。
```

## 注意事项

1. 优先使用 `IMAGE_PATH` 作为 media 参数
2. 如果 `DOWNLOAD_FAILED=true`，使用 `IMAGE_URL` 作为备选
