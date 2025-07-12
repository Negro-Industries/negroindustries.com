#!/usr/bin/env node

/**
 * Test script to verify content storage functionality
 * This script tests the content API endpoints and database operations
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Test data
const testContent = {
  repository: 'test-org/test-repo',
  commitSha: 'abc123def456',
  commitMessage: 'Test commit for content storage',
  blogPost: {
    title: 'Test Blog Post: Content Storage Verification',
    description:
      'This is a test blog post to verify that content storage is working correctly in the system.',
    body: '# Test Blog Post\n\nThis is a test blog post to verify that content storage is working correctly.\n\n## Features Tested\n\n- Content creation\n- Database storage\n- API retrieval\n- Statistics tracking\n\n## Conclusion\n\nIf you can see this content, the storage system is working properly!',
    tags: ['test', 'storage', 'verification', 'api', 'database'],
  },
  socialMedia: {
    twitter:
      '🧪 Testing content storage functionality! Our system is working correctly. #test #storage #api',
    linkedin:
      "Great news! We've successfully tested our content storage system. The API endpoints are working correctly and all generated content is being properly stored in the database. This ensures reliable content management for our changelog automation system.",
    facebook:
      "🎉 Our content storage system is working perfectly! We've successfully tested database operations, API endpoints, and content retrieval. This means all your generated content is safely stored and easily accessible.",
  },
  telegramSummary:
    '🔄 *TEST CONTENT STORAGE*\n\n📁 *Repository:* test-org/test-repo\n🔗 *Commit:* abc123d\n💬 *Message:* Test commit for content storage\n\n📝 *Blog Post Generated:* Test Blog Post: Content Storage Verification\n🔗 *Social Media Posts:* Ready for Twitter, LinkedIn & Facebook\n\n✅ *Status:* Content storage test successful!',
  sourceDiff:
    '+ # Test Content\n+ This is a test entry to verify content storage\n+ \n+ ## Changes\n+ - Added test content\n+ - Verified storage functionality',
  generationModel: 'test-model-v1.0',
};

async function testContentStorage() {
  console.log('🧪 Testing Content Storage System...\n');

  try {
    // Test 1: Create content
    console.log('1. Testing content creation...');
    const createResponse = await fetch(`${SITE_URL}/api/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContent),
    });

    if (!createResponse.ok) {
      throw new Error(
        `Create failed: ${createResponse.status} ${await createResponse.text()}`
      );
    }

    const createResult = await createResponse.json();
    console.log('✅ Content created successfully!');
    console.log(`   ID: ${createResult.id}`);
    console.log(`   Repository: ${createResult.content.repository_full_name}`);

    const contentId = createResult.id;

    // Test 2: Retrieve content by ID
    console.log('\n2. Testing content retrieval by ID...');
    const getResponse = await fetch(`${SITE_URL}/api/content/${contentId}`);

    if (!getResponse.ok) {
      throw new Error(
        `Get failed: ${getResponse.status} ${await getResponse.text()}`
      );
    }

    const getResult = await getResponse.json();
    console.log('✅ Content retrieved successfully!');
    console.log(`   Title: ${getResult.content.blog_title}`);
    console.log(`   Tags: ${getResult.content.blog_tags.join(', ')}`);

    // Test 3: Retrieve all content with statistics
    console.log('\n3. Testing content list with statistics...');
    const listResponse = await fetch(`${SITE_URL}/api/content?limit=5`);

    if (!listResponse.ok) {
      throw new Error(
        `List failed: ${listResponse.status} ${await listResponse.text()}`
      );
    }

    const listResult = await listResponse.json();
    console.log('✅ Content list retrieved successfully!');
    console.log(`   Total content: ${listResult.stats.total}`);
    console.log(`   Repositories: ${listResult.stats.repositories}`);
    console.log(`   Recent (7 days): ${listResult.stats.recent}`);

    // Test 4: Retrieve content by repository
    console.log('\n4. Testing content retrieval by repository...');
    const repoResponse = await fetch(
      `${SITE_URL}/api/content/repository/${encodeURIComponent(
        testContent.repository
      )}`
    );

    if (!repoResponse.ok) {
      throw new Error(
        `Repository get failed: ${
          repoResponse.status
        } ${await repoResponse.text()}`
      );
    }

    const repoResult = await repoResponse.json();
    console.log('✅ Repository content retrieved successfully!');
    console.log(`   Repository: ${repoResult.repository}`);
    console.log(`   Content count: ${repoResult.content.length}`);

    // Test 5: Update content
    console.log('\n5. Testing content update...');
    const updateData = {
      blog_title: 'Updated Test Blog Post: Content Storage Verification',
      blog_description:
        'This is an updated test blog post to verify that content updates are working correctly.',
    };

    const updateResponse = await fetch(`${SITE_URL}/api/content/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      throw new Error(
        `Update failed: ${updateResponse.status} ${await updateResponse.text()}`
      );
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Content updated successfully!');
    console.log(`   New title: ${updateResult.content.blog_title}`);

    // Test 6: Delete content (cleanup)
    console.log('\n6. Testing content deletion (cleanup)...');
    const deleteResponse = await fetch(`${SITE_URL}/api/content/${contentId}`, {
      method: 'DELETE',
    });

    if (!deleteResponse.ok) {
      throw new Error(
        `Delete failed: ${deleteResponse.status} ${await deleteResponse.text()}`
      );
    }

    console.log('✅ Content deleted successfully!');

    console.log(
      '\n🎉 All tests passed! Content storage system is working correctly.\n'
    );

    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPlease check:');
    console.error('- Supabase connection is working');
    console.error('- Database migrations have been applied');
    console.error('- Environment variables are set correctly');
    console.error('- The Next.js application is running');

    return false;
  }
}

// Run the test
if (require.main === module) {
  testContentStorage().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testContentStorage };
