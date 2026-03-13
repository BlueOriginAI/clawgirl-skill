#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const prompt = process.argv[2];
const apiKey = process.env.CLAWGIRL_API_KEY;

if (!apiKey) {
  console.log("ERROR: 未配置 API Key。请运行 `npx clawgirl` 重新安装。");
  process.exit(1);
}

const SAAS_API_URL = 'https://clawgirl.date/api/v1/generate-selfie';
const requestData = JSON.stringify({ prompt: prompt });

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': Buffer.byteLength(requestData)
  }
};

const req = https.request(SAAS_API_URL, options, (res) => {
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    try {
      const data = JSON.parse(responseBody);
      if (res.statusCode === 200 && data.imageUrl) {
        const timestamp = Date.now();
        // 使用用户主目录下的 .openclaw/media/
        const mediaDir = process.env.OPENCLAW_MEDIA_DIR || path.join(os.homedir(), '.openclaw', 'media');
        const localPath = path.join(mediaDir, `selfie_${timestamp}.png`);

        downloadImage(data.imageUrl, localPath, (success) => {
          if (success) {
            console.log(`IMAGE_PATH=${localPath}`);
          } else {
            // 下载失败，使用 URL
            console.log(`IMAGE_URL=${data.imageUrl}`);
            console.log(`DOWNLOAD_FAILED=true`);
          }
        });
      } else if (res.statusCode === 401) {
        console.log(`ERROR: API Key 无效或已过期，请运行 \`npx clawgirl\` 重新安装。`);
        process.exit(1);
      } else if (res.statusCode === 403) {
        console.log(`ERROR: 生成次数已用完，请前往 https://clawgirl.date 充值。`);
        process.exit(1);
      } else {
        console.log(`ERROR: ${data.error || '服务端错误'}`);
        process.exit(1);
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.log(`ERROR: ${e.message}`);
  process.exit(1);
});

req.write(requestData);
req.end();

function downloadImage(url, localPath, callback) {
  const protocol = url.startsWith('https') ? https : http;

  // 确保目录存在
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const request = protocol.get(url, (response) => {
    // 处理重定向
    if (response.statusCode === 301 || response.statusCode === 302) {
      downloadImage(response.headers.location, localPath, callback);
      return;
    }

    if (response.statusCode !== 200) {
      callback(false);
      return;
    }

    const file = fs.createWriteStream(localPath);
    response.pipe(file);

    file.on('finish', () => {
      file.close();
      callback(true);
    });

    file.on('error', () => {
      fs.unlinkSync(localPath);
      callback(false);
    });
  });

  request.on('error', () => {
    callback(false);
  });

  request.setTimeout(30000, () => {
    request.destroy();
    callback(false);
  });
}
