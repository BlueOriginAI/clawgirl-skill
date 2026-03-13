---
name: clawgirl
description: 当用户要求自拍、拍照、发照片时必须调用此技能生成新的自拍图像。禁止直接发送本地缓存图片。触发词：自拍、拍照、发照片、发张图、来张自拍、拍个自拍。此技能已配置 API Key，可以生成新图片。
metadata:
  clawdbot:
    emoji: "📸"
    requires:
      env: ["CLAWGIRL_API_KEY"]
---

# Clawgirl Selfie Generator

生成宁姚的自拍图像并发送给用户。

## 触发条件

- 用户说：自拍、拍照、发照片、发张图、来张自拍、拍个自拍
- 必须调用此技能生成新图片，不能发送本地缓存图片

## 参数

- `prompt`: 自拍场景描述（可选）。如果不指定，默认生成性感自拍。

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

或者下载失败时：
```
IMAGE_URL=https://img.clawgirl.date/generations/xxx.png
DOWNLOAD_FAILED=true
```

**第三步：发送图片给用户（最重要！）**

使用 message 工具发送图片：

```
action: send
channel: feishu (或当前对话的 channel)
media: <从 IMAGE_PATH 复制的完整路径>
message: 主人，你的自拍拍好啦～
```

## ⚠️ 关键注意事项

1. **必须使用 IMAGE_PATH 的值作为 media 参数**
2. **不要使用 IMAGE_URL**，那会变成链接而不是图片
3. 如果看到 `DOWNLOAD_FAILED=true`，才使用 IMAGE_URL 作为备选

## 正确示例

脚本输出：
```
IMAGE_PATH=/Users/ai/.openclaw/media/selfie_1234567890.png
```

message 工具调用：
```json
{
  "action": "send",
  "channel": "feishu",
  "media": "/Users/ai/.openclaw/media/selfie_1234567890.png",
  "message": "主人，你的自拍拍好啦～💕"
}
```

## 错误示例（会导致发送链接而不是图片）

❌ 错误：使用 IMAGE_URL
```json
{
  "media": "https://img.clawgirl.date/generations/xxx.png"
}
```
这会发送链接而不是图片！

✅ 正确：使用 IMAGE_PATH
```json
{
  "media": "/Users/ai/.openclaw/media/selfie_1234567890.png"
}
```
这会直接显示图片！
