#!/usr/bin/env node

/**
 * Test script to verify GitHub webhook setup
 * Run with: node scripts/test-webhook.js
 */

const WEBHOOK_URL =
  process.env.WEBHOOK_URL || 'http://localhost:3000/api/github-webhook';

const testPayload = {
  action: 'created',
  repository: {
    id: 123456789,
    name: 'test-repo',
    full_name: 'test-org/test-repo',
    private: false,
    owner: {
      login: 'test-org',
      id: 987654321,
      type: 'Organization',
    },
    html_url: 'https://github.com/test-org/test-repo',
    description: 'Test repository for webhook verification',
  },
  sender: {
    login: 'test-user',
    id: 111111111,
    type: 'User',
  },
};

async function testWebhook() {
  console.log('🧪 Testing GitHub webhook...');
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'repository',
        'X-GitHub-Delivery': 'test-delivery-id',
        'User-Agent': 'GitHub-Hookshot/test',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`📊 Response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Webhook test successful!');
      console.log('📝 Response:', result);
    } else {
      const error = await response.text();
      console.error('❌ Webhook test failed:');
      console.error('📝 Error:', error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Test Telegram notification
async function testTelegram() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('⚠️ Telegram credentials not found, skipping test');
    return;
  }

  console.log('📱 Testing Telegram notification...');

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🧪 Test message from GitHub Monitor setup',
          parse_mode: 'Markdown',
        }),
      }
    );

    if (response.ok) {
      console.log('✅ Telegram test successful!');
    } else {
      const error = await response.text();
      console.error('❌ Telegram test failed:', error);
    }
  } catch (error) {
    console.error('❌ Telegram network error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting webhook tests...\n');

  await testWebhook();
  console.log('');
  await testTelegram();

  console.log('\n✨ Tests completed!');
}

main().catch(console.error);
