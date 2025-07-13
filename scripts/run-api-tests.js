#!/usr/bin/env node

/**
 * API Testing Runner
 * 
 * This script runs comprehensive tests for the application's API endpoints:
 * 1. Telegram API endpoints and bot functionality
 * 2. GitHub webhook processing and Groq content generation
 * 3. Database storage and retrieval
 * 
 * Usage: 
 * - node scripts/run-api-tests.js (runs all tests)
 * - node scripts/run-api-tests.js --telegram (runs only Telegram tests)
 * - node scripts/run-api-tests.js --groq (runs only Groq/database tests)
 * - node scripts/run-api-tests.js --help (shows help)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  log(`\n${'='.repeat(80)}`, 'cyan');
  log(`${message}`, 'cyan');
  log(`${'='.repeat(80)}`, 'cyan');
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

function showHelp() {
  logHeader('API Testing Runner - Help');
  
  log('\nUsage:', 'bright');
  log('  node scripts/run-api-tests.js [options]');
  
  log('\nOptions:', 'bright');
  log('  --telegram    Run only Telegram API tests');
  log('  --groq        Run only Groq/database tests');
  log('  --help        Show this help message');
  log('  (no options)  Run all tests');
  
  log('\nDescription:', 'bright');
  log('  This script runs comprehensive tests for the application\'s API endpoints.');
  log('  It tests Telegram bot functionality, GitHub webhook processing,');
  log('  Groq AI content generation, and database storage/retrieval.');
  
  log('\nPrerequisites:', 'bright');
  log('  - Next.js application running on http://localhost:3000');
  log('  - Environment variables set in .env file:');
  log('    * TELEGRAM_BOT_TOKEN (required for Telegram tests)');
  log('    * TELEGRAM_CHAT_ID (required for Telegram tests)');
  log('    * GROQ_API_KEY (required for Groq tests)');
  log('  - Supabase database running and accessible');
  
  log('\nExamples:', 'bright');
  log('  node scripts/run-api-tests.js');
  log('  node scripts/run-api-tests.js --telegram');
  log('  node scripts/run-api-tests.js --groq');
  
  log('\n');
}

async function runScript(scriptPath, testName) {
  return new Promise((resolve, reject) => {
    logInfo(`Starting ${testName}...`);
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        logSuccess(`${testName} completed successfully`);
        resolve(true);
      } else {
        logError(`${testName} failed with exit code ${code}`);
        resolve(false);
      }
    });
    
    child.on('error', (error) => {
      logError(`${testName} failed to start: ${error.message}`);
      reject(error);
    });
  });
}

async function runTelegramTests() {
  const scriptPath = join(__dirname, 'test-telegram-api.js');
  return await runScript(scriptPath, 'Telegram API Tests');
}

async function runGroqTests() {
  const scriptPath = join(__dirname, 'test-groq-database.js');
  return await runScript(scriptPath, 'Groq & Database Tests');
}

async function runAllTests() {
  logHeader('Running All API Tests');
  
  const results = {
    telegram: false,
    groq: false,
  };
  
  try {
    // Run Telegram tests
    results.telegram = await runTelegramTests();
    
    // Add some spacing between test suites
    log('\n' + '─'.repeat(60), 'yellow');
    
    // Run Groq tests
    results.groq = await runGroqTests();
    
    // Summary
    logHeader('Test Results Summary');
    
    if (results.telegram) {
      logSuccess('Telegram API Tests: PASSED');
    } else {
      logError('Telegram API Tests: FAILED');
    }
    
    if (results.groq) {
      logSuccess('Groq & Database Tests: PASSED');
    } else {
      logError('Groq & Database Tests: FAILED');
    }
    
    const allPassed = results.telegram && results.groq;
    
    if (allPassed) {
      logSuccess('All tests passed! 🎉');
      process.exit(0);
    } else {
      logError('Some tests failed. Please check the output above for details.');
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--telegram')) {
    logHeader('Running Telegram API Tests Only');
    const success = await runTelegramTests();
    process.exit(success ? 0 : 1);
  }
  
  if (args.includes('--groq')) {
    logHeader('Running Groq & Database Tests Only');
    const success = await runGroqTests();
    process.exit(success ? 0 : 1);
  }
  
  // Default: run all tests
  await runAllTests();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at ${promise}: ${reason}`);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  logError(`Main execution failed: ${error.message}`);
  process.exit(1);
}); 