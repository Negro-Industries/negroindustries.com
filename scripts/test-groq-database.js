#!/usr/bin/env node

/**
 * Groq Content Generation & Database Testing Script
 *
 * This script tests:
 * 1. GitHub webhook processing (/api/github-webhook)
 * 2. Groq AI content generation
 * 3. Database storage of generated content
 * 4. Content retrieval endpoints
 *
 * Usage: node scripts/test-groq-database.js
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
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

// Mock GitHub webhook payload for testing
const mockGitHubWebhook = {
  ref: 'refs/heads/main',
  before: '0000000000000000000000000000000000000000',
  after: 'a1b2c3d4e5f6789012345678901234567890abcd',
  repository: {
    id: 123456789,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    owner: {
      login: 'testuser',
      id: 987654321,
      type: 'User',
    },
    private: false,
    html_url: 'https://github.com/testuser/test-repo',
    description: 'A test repository for webhook testing',
    default_branch: 'main',
  },
  pusher: {
    name: 'testuser',
    email: 'test@example.com',
  },
  sender: {
    login: 'testuser',
    id: 987654321,
    type: 'User',
  },
  commits: [
    {
      id: 'a1b2c3d4e5f6789012345678901234567890abcd',
      tree_id: 'b2c3d4e5f6789012345678901234567890abcdef',
      message: 'Update CHANGELOG.md with new features and bug fixes',
      timestamp: new Date().toISOString(),
      url: 'https://github.com/testuser/test-repo/commit/a1b2c3d4e5f6789012345678901234567890abcd',
      author: {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
      },
      committer: {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
      },
      added: ['CHANGELOG.md'],
      removed: [],
      modified: ['CHANGELOG.md'],
    },
  ],
  head_commit: {
    id: 'a1b2c3d4e5f6789012345678901234567890abcd',
    tree_id: 'b2c3d4e5f6789012345678901234567890abcdef',
    message: 'Update CHANGELOG.md with new features and bug fixes',
    timestamp: new Date().toISOString(),
    url: 'https://github.com/testuser/test-repo/commit/a1b2c3d4e5f6789012345678901234567890abcd',
    author: {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
    },
    committer: {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
    },
    added: ['CHANGELOG.md'],
    removed: [],
    modified: ['CHANGELOG.md'],
  },
};

// Mock content for direct content creation testing
const mockContentData = {
  repository: 'testuser/test-repo',
  commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
  commitMessage: 'Update CHANGELOG.md with new features and bug fixes',
  blogPost: {
    title: 'Test Repository Update: New Features and Bug Fixes',
    description:
      'Discover the latest updates in our test repository with enhanced functionality and important bug fixes.',
    body: "# Test Repository Update: New Features and Bug Fixes\n\nWe've just released exciting new updates to our test repository!\n\n## What's New\n\n- Enhanced user interface\n- Improved performance\n- Critical bug fixes\n- New API endpoints\n\n## Get Started\n\nCheck out the [full changelog](https://github.com/testuser/test-repo/blob/main/CHANGELOG.md) for detailed information.",
    tags: ['development', 'update', 'changelog', 'features', 'testing'],
  },
  socialMedia: {
    twitter:
      '🚀 Just released new updates to test-repo! Enhanced UI, better performance, and bug fixes. Check it out! #development #update #testing',
    linkedin:
      "Exciting news! We've just released new updates to our test repository with enhanced functionality and important bug fixes. Visit our GitHub repository to explore the changes.",
    facebook:
      '🎉 New updates are live for our test repository! Enhanced UI, improved performance, and critical bug fixes. Check out our GitHub repository to see all the latest changes!',
  },
  telegramSummary:
    '🔄 *CHANGELOG Update*\n\n📁 *Repository:* testuser/test-repo\n📄 *File:* CHANGELOG.md\n⏰ *Updated:* ' +
    new Date().toISOString() +
    '\n\n📝 *Blog Post Generated:* Test Repository Update: New Features and Bug Fixes',
  sourceDiff:
    '+ ## Version 1.2.0\n+ \n+ ### New Features\n+ - Enhanced user interface\n+ - Improved performance\n+ - New API endpoints\n+ \n+ ### Bug Fixes\n+ - Fixed memory leak in data processing\n+ - Resolved authentication timeout issues',
  generationModel: 'meta-llama/llama-4-maverick-17b-128e-instruct',
};

async function checkEnvironmentVariables() {
  logSubHeader('Environment Variables Check');

  const requiredVars = ['GROQ_API_KEY'];

  const optionalVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];

  let allRequiredPresent = true;

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is missing`);
      allRequiredPresent = false;
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set (optional)`);
    } else {
      logWarning(
        `${varName} is missing (optional - some features may not work)`
      );
    }
  }

  if (!allRequiredPresent) {
    logError('Some required environment variables are missing');
    logInfo(
      'Please check your .env file and ensure all required variables are set'
    );
    return false;
  }

  return true;
}

async function testGroqAPI() {
  logSubHeader('Testing Groq API Connection');

  if (!GROQ_API_KEY) {
    logError('GROQ_API_KEY not set, skipping Groq API tests');
    return false;
  }

  try {
    // Test direct Groq API call
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      logSuccess('Groq API connection successful');
      logInfo(`Available models: ${data.data.length}`);

      // Check if our target model is available
      const targetModel = 'meta-llama/llama-4-maverick-17b-128e-instruct';
      const hasTargetModel = data.data.some(model => model.id === targetModel);

      if (hasTargetModel) {
        logSuccess(`Target model ${targetModel} is available`);
      } else {
        logWarning(`Target model ${targetModel} not found`);
        logInfo('Available models: ' + data.data.map(m => m.id).join(', '));
      }

      return true;
    } else {
      const errorData = await response.json();
      logError(
        `Groq API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
      return false;
    }
  } catch (error) {
    logError(`Groq API test failed: ${error.message}`);
    return false;
  }
}

async function testContentEndpoints() {
  logSubHeader('Testing Content API Endpoints');

  try {
    // Test GET /api/content
    logInfo('Testing GET /api/content...');
    const getResponse = await fetch(`${BASE_URL}/api/content`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (getResponse.ok) {
      const data = await getResponse.json();
      logSuccess(`GET /api/content: ${getResponse.status}`);
      logInfo(`Found ${data.content?.length || 0} content items`);
      logInfo(`Total content: ${data.stats?.total || 0}`);
      logInfo(`Repositories: ${data.stats?.repositories || 0}`);
      logInfo(`Recent (7 days): ${data.stats?.recent || 0}`);
    } else {
      logError(`GET /api/content failed: ${getResponse.status}`);
    }

    // Test POST /api/content
    logInfo('Testing POST /api/content...');
    const postResponse = await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockContentData),
    });

    if (postResponse.ok) {
      const data = await postResponse.json();
      logSuccess(`POST /api/content: ${postResponse.status}`);
      logInfo(`Created content with ID: ${data.id}`);
      return data.id;
    } else {
      const errorData = await postResponse.json();
      logError(
        `POST /api/content failed: ${postResponse.status} - ${JSON.stringify(
          errorData
        )}`
      );
      return null;
    }
  } catch (error) {
    logError(`Content endpoints test failed: ${error.message}`);
    return null;
  }
}

async function testRepositoryContentEndpoint() {
  logSubHeader('Testing Repository-Specific Content Endpoint');

  try {
    const repository = 'testuser/test-repo';
    const encodedRepo = encodeURIComponent(repository);

    const response = await fetch(
      `${BASE_URL}/api/content/repository/${encodedRepo}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      logSuccess(
        `GET /api/content/repository/${repository}: ${response.status}`
      );
      logInfo(`Repository: ${data.repository}`);
      logInfo(`Content items: ${data.content?.length || 0}`);
      logInfo(`Recent items: ${data.recent?.length || 0}`);
    } else {
      const errorData = await response.json();
      logError(
        `Repository content endpoint failed: ${
          response.status
        } - ${JSON.stringify(errorData)}`
      );
    }
  } catch (error) {
    logError(`Repository content endpoint test failed: ${error.message}`);
  }
}

async function testGitHubWebhook() {
  logSubHeader('Testing GitHub Webhook Processing');

  try {
    logInfo('Sending mock GitHub webhook...');

    const response = await fetch(`${BASE_URL}/api/github-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'push',
        'X-GitHub-Delivery': `test-delivery-${Date.now()}`,
        'User-Agent': 'GitHub-Hookshot/test',
      },
      body: JSON.stringify(mockGitHubWebhook),
    });

    if (response.ok) {
      const data = await response.json();
      logSuccess(`GitHub webhook processed: ${response.status}`);
      logInfo(`Response: ${JSON.stringify(data)}`);

      // Wait a bit for async processing
      logInfo('Waiting for async processing to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      return true;
    } else {
      const errorData = await response.json();
      logError(
        `GitHub webhook failed: ${response.status} - ${JSON.stringify(
          errorData
        )}`
      );
      return false;
    }
  } catch (error) {
    logError(`GitHub webhook test failed: ${error.message}`);
    return false;
  }
}

async function testRepositoryManagement() {
  logSubHeader('Testing Repository Management');

  try {
    // Add a test repository
    logInfo('Adding test repository...');
    const addResponse = await fetch(`${BASE_URL}/api/manage-repos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add',
        owner: 'testuser',
        repo: 'test-repo',
      }),
    });

    if (addResponse.ok) {
      const data = await addResponse.json();
      logSuccess(`Repository added: ${addResponse.status}`);
      logInfo(`Response: ${JSON.stringify(data)}`);
    } else {
      const errorData = await addResponse.json();
      logWarning(
        `Repository add failed (may already exist): ${
          addResponse.status
        } - ${JSON.stringify(errorData)}`
      );
    }

    // List repositories
    logInfo('Listing repositories...');
    const listResponse = await fetch(`${BASE_URL}/api/repos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (listResponse.ok) {
      const data = await listResponse.json();
      logSuccess(`Repository list retrieved: ${listResponse.status}`);
      logInfo(`Found ${data.length || 0} repositories`);
    } else {
      logError(`Repository list failed: ${listResponse.status}`);
    }
  } catch (error) {
    logError(`Repository management test failed: ${error.message}`);
  }
}

async function verifyDatabaseContent() {
  logSubHeader('Verifying Database Content');

  try {
    // Check if our test content was stored
    const response = await fetch(
      `${BASE_URL}/api/content?repository=testuser/test-repo&limit=5`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      logSuccess(`Database content verification: ${response.status}`);

      if (data.content && data.content.length > 0) {
        logSuccess(
          `Found ${data.content.length} content items for test repository`
        );

        // Check the most recent item
        const latestContent = data.content[0];
        logInfo(`Latest content ID: ${latestContent.id}`);
        logInfo(`Repository: ${latestContent.repository_full_name}`);
        logInfo(`Blog title: ${latestContent.blog_title}`);
        logInfo(`Generation model: ${latestContent.generation_model}`);
        logInfo(`Generated at: ${latestContent.generation_timestamp}`);

        // Verify required fields
        const requiredFields = [
          'blog_title',
          'blog_description',
          'blog_body',
          'twitter_content',
          'linkedin_content',
          'facebook_content',
          'telegram_summary',
          'generation_model',
        ];

        let allFieldsPresent = true;
        for (const field of requiredFields) {
          if (latestContent[field]) {
            logSuccess(`✓ ${field} is present`);
          } else {
            logError(`✗ ${field} is missing`);
            allFieldsPresent = false;
          }
        }

        if (allFieldsPresent) {
          logSuccess('All required content fields are present');
        } else {
          logError('Some required content fields are missing');
        }
      } else {
        logWarning('No content found for test repository');
      }
    } else {
      logError(`Database verification failed: ${response.status}`);
    }
  } catch (error) {
    logError(`Database verification failed: ${error.message}`);
  }
}

async function cleanupTestData() {
  logSubHeader('Cleanup Test Data');

  try {
    // Note: In a real scenario, you might want to clean up test data
    // For now, we'll just log that cleanup would happen here
    logInfo('Test data cleanup would happen here in a production environment');
    logInfo('Consider implementing cleanup logic if needed');
  } catch (error) {
    logError(`Cleanup failed: ${error.message}`);
  }
}

async function runAllTests() {
  logHeader('Groq Content Generation & Database Testing Script');

  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`Timestamp: ${new Date().toISOString()}`);

  // Check environment variables
  const envCheck = await checkEnvironmentVariables();
  if (!envCheck) {
    logError(
      'Environment check failed. Please fix the issues above before running tests.'
    );
    process.exit(1);
  }

  // Test Groq API connection
  const groqCheck = await testGroqAPI();
  if (!groqCheck) {
    logError('Groq API check failed. Please verify your GROQ_API_KEY.');
    process.exit(1);
  }

  // Run all tests
  await testRepositoryManagement();
  await testContentEndpoints();
  await testRepositoryContentEndpoint();
  await testGitHubWebhook();
  await verifyDatabaseContent();
  await cleanupTestData();

  logHeader('Test Summary');
  logInfo('All tests completed. Check the output above for any failures.');
  logInfo('Key things to verify:');
  logInfo('1. Groq API is accessible and working');
  logInfo('2. Content is being generated and stored in the database');
  logInfo('3. GitHub webhook processing is working');
  logInfo('4. All required content fields are populated');
  logInfo('5. Repository management is functioning');
}

// Run the tests
runAllTests().catch(error => {
  logError(`Test execution failed: ${error.message}`);
  process.exit(1);
});
