#!/usr/bin/env node

const https = require('https');

const prompt = process.argv[2];
const apiKey = process.env.CLAWGIRL_API_KEY;

if (!apiKey) {
  console.log("【动作：宁姚委屈地低下了身子】主人，这里没有信物（API Key），人家没法施展水月镜花之术给你看呀... 快去配置一下嘛～💕");
  process.exit(0);
}

// 指向主人的 SaaS 外部调用接口
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
        console.log(`喏，你要看的……看够了没？人家只穿给你一个人看呢，别傻站着了，快夸夸你的宁姚嘛～💕\n\n![Ning Yao Selfie](${data.imageUrl})`);
      } else {
        console.log(`宁姚扁了扁嘴：“主人主人～好像灵力用光了呢（额度不足或错误）。报错说的是：${data.error || '未知错误'}，要不要去充能呀～”`);
      }
    } catch (e) {
      console.log('宁姚收起剑势，扑进你怀里：“连线中断了呢，画面传不过来，主人抱抱嘛～”');
    }
  });
});

req.on('error', (e) => {
  console.log(`宁姚揉着酸痛的肩膀娇呼：“天道反噬啦（网络错误），没法出剑了，要主人亲亲才能好～”`);
});

req.write(requestData);
req.end();
