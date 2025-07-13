#!/usr/bin/env node

/**
 * Telegram API Testing Script
 * 
 * This script tests all Telegram-related API endpoints:
 * 1. Telegram webhook endpoint (/api/telegram-webhook)
 * 2. Setup endpoint (/api/setup) - for webhook configuration
 * 3. Various Telegram bot commands
 * 
 * Usage: node scripts/test-telegram-api.js
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${message}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSubHeader(message) {
  log(`\n${'-'.repeat(40)}`, 'yellow');
  log(`${message}`, 'yellow');
  log(`${'-'.repeat(40)}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Mock Telegram update payloads for testing
const mockTelegramUpdates = {
  start: {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: '/start',
    },
  },
  help: {
    update_id: 123456790,
    message: {
      message_id: 2,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: '/help',
    },
  },
  repos: {
    update_id: 123456791,
    message: {
      message_id: 3,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: '/repos',
    },
  },
  orgs: {
    update_id: 123456792,
    message: {
      message_id: 4,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: '/orgs',
    },
  },
  sync: {
    update_id: 123456793,
    message: {
      message_id: 5,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: '/sync',
    },
  },
  unknown: {
    update_id: 123456794,
    message: {
      message_id: 6,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: '/unknown',
    },
  },
  regularMessage: {
    update_id: 123456795,
    message: {
      message_id: 7,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      text: 'Hello, this is a regular message',
    },
  },
  nonTextMessage: {
    update_id: 123456796,
    message: {
      message_id: 8,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser',
      },
      chat: {
        id: parseInt(TELEGRAM_CHAT_ID || '123456789'),
        first_name: 'Test',
        username: 'testuser',
        type: 'private',
      },
      date: Math.floor(Date.now() / 1000),
      // No text property - simulates photo/sticker/etc
    },
  },
  updateWithoutMessage: {
    update_id: 123456797,
    // No message property - simulates callback query or other update types
  },
};

async function checkEnvironmentVariables() {
  logSubHeader('Environment Variables Check');
  
  const requiredVars = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is missing`);
      allPresent = false;
    }
  }
  
  if (!allPresent) {
    logError('Some required environment variables are missing');
    logInfo('Please check your .env file and ensure all required variables are set');
    return false;
  }
  
  return true;
}

async function testTelegramWebhookEndpoint() {
  logSubHeader('Testing Telegram Webhook Endpoint');
  
  const endpoint = `${BASE_URL}/api/telegram-webhook`;
  logInfo(`Testing endpoint: ${endpoint}`);
  
  for (const [testName, payload] of Object.entries(mockTelegramUpdates)) {
    try {
      log(`\nTesting ${testName} command...`, 'blue');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        logSuccess(`${testName}: ${response.status} - ${JSON.stringify(responseData)}`);
      } else {
        logError(`${testName}: ${response.status} - ${JSON.stringify(responseData)}`);
      }
    } catch (error) {
      logError(`${testName}: ${error.message}`);
    }
  }
}

async function testSetupEndpoint() {
  logSubHeader('Testing Setup Endpoint');
  
  const endpoint = `${BASE_URL}/api/setup`;
  logInfo(`Testing endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      logSuccess(`Setup endpoint: ${response.status}`);
      logInfo(`Response: ${JSON.stringify(responseData, null, 2)}`);
    } else {
      logError(`Setup endpoint: ${response.status} - ${JSON.stringify(responseData)}`);
    }
  } catch (error) {
    logError(`Setup endpoint: ${error.message}`);
  }
}

async function testTelegramBotAPI() {
  logSubHeader('Testing Telegram Bot API Connection');
  
  if (!TELEGRAM_BOT_TOKEN) {
    logError('TELEGRAM_BOT_TOKEN not set, skipping bot API tests');
    return;
  }
  
  try {
    // Test getMe endpoint
    const getMeUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
    const getMeResponse = await fetch(getMeUrl);
    const getMeData = await getMeResponse.json();
    
    if (getMeData.ok) {
      logSuccess('Bot API connection successful');
      logInfo(`Bot info: ${getMeData.result.first_name} (@${getMeData.result.username})`);
    } else {
      logError(`Bot API error: ${getMeData.description}`);
    }
    
    // Test webhook info
    const webhookInfoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
    const webhookResponse = await fetch(webhookInfoUrl);
    const webhookData = await webhookResponse.json();
    
    if (webhookData.ok) {
      logSuccess('Webhook info retrieved');
      logInfo(`Webhook URL: ${webhookData.result.url || 'Not set'}`);
      logInfo(`Pending updates: ${webhookData.result.pending_update_count}`);
      if (webhookData.result.last_error_date) {
        logWarning(`Last error: ${webhookData.result.last_error_message}`);
      }
    } else {
      logError(`Webhook info error: ${webhookData.description}`);
    }
    
  } catch (error) {
    logError(`Bot API test failed: ${error.message}`);
  }
}

async function testSendMessage() {
  logSubHeader('Testing Direct Message Send');
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    logError('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping message send test');
    return;
  }
  
  try {
    const sendMessageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const message = {
      chat_id: TELEGRAM_CHAT_ID,
      text: `🧪 Test message from API test script\n\nTimestamp: ${new Date().toISOString()}\n\nThis is a test to verify the Telegram API integration is working correctly.`,
      parse_mode: 'Markdown',
    };
    
    const response = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const responseData = await response.json();
    
    if (responseData.ok) {
      logSuccess('Test message sent successfully');
      logInfo(`Message ID: ${responseData.result.message_id}`);
    } else {
      logError(`Failed to send message: ${responseData.description}`);
    }
  } catch (error) {
    logError(`Message send test failed: ${error.message}`);
  }
}

async function testEndpointHealth() {
  logSubHeader('Testing Endpoint Health');
  
  const endpoints = [
    '/api/telegram-webhook',
    '/api/setup',
    '/api/content',
    '/api/manage-repos',
    '/api/manage-orgs',
    '/api/sync-orgs',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // For POST-only endpoints, we expect 405 Method Not Allowed
      if (response.status === 405) {
        logSuccess(`${endpoint}: Endpoint exists (POST-only)`);
      } else if (response.status === 200) {
        logSuccess(`${endpoint}: Endpoint healthy (GET supported)`);
      } else {
        logWarning(`${endpoint}: Status ${response.status}`);
      }
    } catch (error) {
      logError(`${endpoint}: ${error.message}`);
    }
  }
}

async function runAllTests() {
  logHeader('Telegram API Testing Script');
  
  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`Timestamp: ${new Date().toISOString()}`);
  
  // Check environment variables
  const envCheck = await checkEnvironmentVariables();
  if (!envCheck) {
    logError('Environment check failed. Please fix the issues above before running tests.');
    process.exit(1);
  }
  
  // Run all tests
  await testEndpointHealth();
  await testTelegramBotAPI();
  await testSetupEndpoint();
  await testTelegramWebhookEndpoint();
  await testSendMessage();
  
  logHeader('Test Summary');
  logInfo('All tests completed. Check the output above for any failures.');
  logInfo('If you see any errors, please check your environment variables and network connectivity.');
}

// Run the tests
runAllTests().catch((error) => {
  logError(`Test execution failed: ${error.message}`);
  process.exit(1);
}); 