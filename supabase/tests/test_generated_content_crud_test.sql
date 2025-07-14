-- Test generated content table CRUD operations
-- This test ensures agents can save content and dashboard can display it properly

begin;

-- Load the TAP functions
select plan(25);

-- Clean up any existing data first
delete from public.generated_content;

-- Test 1: Check that the generated_content table exists
select has_table('public', 'generated_content', 'generated_content table should exist');

-- Test 2: Check that all required columns exist
select has_column('public', 'generated_content', 'id', 'id column should exist');
select has_column('public', 'generated_content', 'repository_full_name', 'repository_full_name column should exist');
select has_column('public', 'generated_content', 'commit_sha', 'commit_sha column should exist');
select has_column('public', 'generated_content', 'commit_message', 'commit_message column should exist');
select has_column('public', 'generated_content', 'content_type', 'content_type column should exist');
select has_column('public', 'generated_content', 'blog_title', 'blog_title column should exist');
select has_column('public', 'generated_content', 'blog_description', 'blog_description column should exist');
select has_column('public', 'generated_content', 'blog_body', 'blog_body column should exist');
select has_column('public', 'generated_content', 'blog_tags', 'blog_tags column should exist');
select has_column('public', 'generated_content', 'twitter_content', 'twitter_content column should exist');
select has_column('public', 'generated_content', 'linkedin_content', 'linkedin_content column should exist');
select has_column('public', 'generated_content', 'facebook_content', 'facebook_content column should exist');
select has_column('public', 'generated_content', 'telegram_summary', 'telegram_summary column should exist');
select has_column('public', 'generated_content', 'source_diff', 'source_diff column should exist');
select has_column('public', 'generated_content', 'generation_model', 'generation_model column should exist');
select has_column('public', 'generated_content', 'generation_timestamp', 'generation_timestamp column should exist');
select has_column('public', 'generated_content', 'created_at', 'created_at column should exist');
select has_column('public', 'generated_content', 'updated_at', 'updated_at column should exist');

-- Test 3: Test INSERT operation (agent saving content)
insert into public.generated_content (
    repository_full_name,
    commit_sha,
    commit_message,
    content_type,
    blog_title,
    blog_description,
    blog_body,
    blog_tags,
    twitter_content,
    linkedin_content,
    facebook_content,
    telegram_summary,
    source_diff,
    generation_model,
    generation_timestamp
) values (
    'test-org/test-repo',
    'abc123def456',
    'Test commit message',
    'changelog_analysis',
    'Test Blog Title',
    'Test blog description for SEO',
    'Test blog body content with markdown',
    array['test', 'changelog', 'github'],
    'Test Twitter content #test',
    'Test LinkedIn content for professional network',
    'Test Facebook content for social media',
    'Test Telegram summary for notifications',
    '+ Added new feature\n- Fixed bug',
    'test-model-v1',
    now()
);

-- Test 4: Verify the insert worked
select ok(
    (select count(*) from public.generated_content where repository_full_name = 'test-org/test-repo') = 1,
    'Content should be inserted successfully'
);

-- Test 5: Test SELECT operation (dashboard displaying content)
select ok(
    (select blog_title from public.generated_content where repository_full_name = 'test-org/test-repo') = 'Test Blog Title',
    'Should be able to read blog title'
);

-- Test 6: Test UPDATE operation
update public.generated_content 
set blog_title = 'Updated Blog Title'
where repository_full_name = 'test-org/test-repo';

select ok(
    (select blog_title from public.generated_content where repository_full_name = 'test-org/test-repo') = 'Updated Blog Title',
    'Should be able to update content'
);

-- Test 7: Test DELETE operation
delete from public.generated_content where repository_full_name = 'test-org/test-repo';

select ok(
    (select count(*) from public.generated_content where repository_full_name = 'test-org/test-repo') = 0,
    'Should be able to delete content'
);

-- Test 8: Test multiple inserts for pagination (dashboard functionality)
insert into public.generated_content (
    repository_full_name,
    blog_title,
    blog_description,
    blog_body,
    blog_tags,
    twitter_content,
    linkedin_content,
    facebook_content,
    telegram_summary,
    generation_timestamp
) values 
    ('repo1/test', 'Title 1', 'Description 1', 'Body 1', array['tag1'], 'Twitter 1', 'LinkedIn 1', 'Facebook 1', 'Telegram 1', now() - interval '1 day'),
    ('repo2/test', 'Title 2', 'Description 2', 'Body 2', array['tag2'], 'Twitter 2', 'LinkedIn 2', 'Facebook 2', 'Telegram 2', now() - interval '2 days'),
    ('repo3/test', 'Title 3', 'Description 3', 'Body 3', array['tag3'], 'Twitter 3', 'LinkedIn 3', 'Facebook 3', 'Telegram 3', now() - interval '3 days');

select ok(
    (select count(*) from public.generated_content) = 3,
    'Should be able to insert multiple records'
);

-- Test 9: Test ordering by generation_timestamp (dashboard default order)
select ok(
    (select blog_title from public.generated_content order by generation_timestamp desc limit 1) = 'Title 1',
    'Should order by generation_timestamp descending'
);

-- Clean up
delete from public.generated_content;

select * from finish();
rollback;
