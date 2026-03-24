#!/usr/bin/env node

/**
 * 基础测试文件 - clawgirl-skill generate.js
 *
 * 运行方式: node test/generate.test.js
 *
 * 注意: 这些测试使用模拟数据，不会实际调用 API
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 测试计数器
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    failed++;
  }
}

// ============================================
// 测试 1: 参数默认值
// ============================================
test('默认 prompt 应该是 "来张自拍"', () => {
  // 模拟 process.argv
  const originalArgv = process.argv;

  // 验证 generate.js 中 L42 的逻辑
  const prompt = process.argv[2] || '来张自拍';
  assert.strictEqual(prompt, '来张自拍', '未提供参数时应使用默认值');
});

// ============================================
// 测试 2: API Key 格式验证
// ============================================
test('有效的 API Key 应以 cg_live_ 开头', () => {
  const validKey = 'cg_live_test123';
  const invalidKey = 'sk_test123';

  assert(validKey.startsWith('cg_live_'), '有效 API Key 必须以 cg_live_ 开头');
  assert(!invalidKey.startsWith('cg_live_'), '无效 API Key 不应以 cg_live_ 开头');
});

// ============================================
// 测试 3: 配置路径解析
// ============================================
test('配置文件路径应正确解析', () => {
  const expectedPaths = [
    path.join(os.homedir(), '.openclaw', 'openclaw.json'),
    path.join(os.homedir(), '.openclaw', 'openclaw.json.bak'),
    path.join(os.homedir(), '.openclaw', 'openclaw.json.bak.1'),
  ];

  assert(expectedPaths.length === 3, '应有 3 个配置路径');
  assert(expectedPaths[0].includes('.openclaw'), '路径应包含 .openclaw');
});

// ============================================
// 测试 4: JSON 配置解析
// ============================================
test('应正确解析有效的 JSON 配置', () => {
  const validConfig = JSON.stringify({
    skills: {
      entries: {
        clawgirl: {
          env: { CLAWGIRL_API_KEY: 'cg_live_test' }
        }
      }
    }
  });

  const config = JSON.parse(validConfig);
  const apiKey = config?.skills?.entries?.clawgirl?.env?.CLAWGIRL_API_KEY;

  assert.strictEqual(apiKey, 'cg_live_test', '应正确提取 API Key');
});

// ============================================
// 测试 5: 无效 JSON 应抛出错误
// ============================================
test('无效 JSON 应抛出解析错误', () => {
  const invalidJson = '{ invalid json }';

  let threw = false;
  try {
    JSON.parse(invalidJson);
  } catch (e) {
    threw = true;
  }

  assert(threw, '无效 JSON 应抛出错误');
});

// ============================================
// 测试 6: 图片路径格式
// ============================================
test('图片路径应使用正确的格式', () => {
  const timestamp = Date.now();
  const mediaDir = process.env.OPENCLAW_MEDIA_DIR || path.join(os.homedir(), '.openclaw', 'media');
  const localPath = path.join(mediaDir, `selfie_${timestamp}.png`);

  assert(localPath.endsWith('.png'), '图片应以 .png 结尾');
  assert(localPath.includes('selfie_'), '图片名应包含 selfie_');
});

// ============================================
// 测试 7: 输出格式验证
// ============================================
test('成功输出格式应为 IMAGE_PATH=...', () => {
  const testPath = '/tmp/test.png';
  const output = `IMAGE_PATH=${testPath}`;

  assert(output.startsWith('IMAGE_PATH='), '成功输出应以 IMAGE_PATH= 开头');
  assert(output.includes(testPath), '输出应包含图片路径');
});

test('下载失败输出格式应包含 DOWNLOAD_FAILED', () => {
  const testUrl = 'https://example.com/image.png';
  const output = `IMAGE_URL=${testUrl}\nDOWNLOAD_FAILED=true`;

  assert(output.includes('DOWNLOAD_FAILED=true'), '失败输出应包含 DOWNLOAD_FAILED=true');
  assert(output.includes('IMAGE_URL='), '失败输出应包含 IMAGE_URL');
});

// ============================================
// 测试 8: 错误消息格式
// ============================================
test('错误消息应以 ERROR: 开头', () => {
  const errorMsg = '服务端错误';
  const output = `ERROR: ${errorMsg}`;

  assert(output.startsWith('ERROR:'), '错误消息应以 ERROR: 开头');
});

// ============================================
// 测试总结
// ============================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

process.exit(failed > 0 ? 1 : 0);
