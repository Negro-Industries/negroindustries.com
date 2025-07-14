-- Test data validation and edge cases
-- This test ensures data validation works correctly and handles edge cases

begin;

-- Load the TAP functions
select plan(16);

-- Test 1: Test that required fields cannot be null
select throws_ok(
    $$insert into public.generated_content (commit_sha) values ('abc123')$$,
    'null value in column "repository_full_name" of relation "generated_content" violates not-null constraint'
);

select throws_ok(
    $$insert into public.generated_content (repository_full_name) values ('test/repo')$$,
    'null value in column "blog_title" of relation "generated_content" violates not-null constraint'
);

select throws_ok(
    $$insert into public.activity_logs (source) values ('github')$$,
    'null value in column "event_type" of relation "activity_logs" violates not-null constraint'
);

select throws_ok(
    $$insert into public.activity_logs (event_type) values ('push')$$,
    'null value in column "source" of relation "activity_logs" violates not-null constraint'
);

-- Test 2: Test that empty strings are handled correctly
insert into public.generated_content (
    repository_full_name,
    blog_title,
    blog_description,
    blog_body,
    blog_tags,
    twitter_content,
    linkedin_content,
    facebook_content,
    telegram_summary
) values (
    'test/repo',
    '',
    '',
    '',
    array[]::text[],
    '',
    '',
    '',
    ''
);

select ok(
    (select count(*) from public.generated_content where repository_full_name = 'test/repo') = 1,
    'Should allow empty strings for optional text fields'
);

-- Test 3: Test that arrays work correctly
insert into public.generated_content (
    repository_full_name,
    blog_title,
    blog_description,
    blog_body,
    blog_tags,
    twitter_content,
    linkedin_content,
    facebook_content,
    telegram_summary
) values (
    'test/repo-arrays',
    'Test Array Tags',
    'Test Description',
    'Test Body',
    array['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    'Test Twitter',
    'Test LinkedIn',
    'Test Facebook',
    'Test Telegram'
);

select ok(
    array_length((select blog_tags from public.generated_content where repository_full_name = 'test/repo-arrays'), 1) = 5,
    'Should handle arrays with multiple elements'
);

-- Test 4: Test JSONB validation for activity_logs
insert into public.activity_logs (
    event_type,
    source,
    user_id,
    metadata
) values (
    'complex_event',
    'github',
    'user123',
    '{"repository": {"name": "test-repo", "owner": "test-org"}, "commits": [{"sha": "abc123", "message": "test"}], "branch": "main"}'::jsonb
);

select ok(
    (select metadata->>'repository' from public.activity_logs where event_type = 'complex_event') is not null,
    'Should handle complex nested JSONB data'
);

-- Test 5: Test that NULL values are handled correctly where allowed
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
    commit_sha,
    commit_message,
    source_diff,
    generation_model
) values (
    'test/repo-nulls',
    'Test Nulls',
    'Test Description',
    'Test Body',
    array['test'],
    'Test Twitter',
    'Test LinkedIn',
    'Test Facebook',
    'Test Telegram',
    null,
    null,
    null,
    null
);

select ok(
    (select count(*) from public.generated_content where repository_full_name = 'test/repo-nulls') = 1,
    'Should allow NULL values for optional fields'
);

-- Test 6: Test very long text content
insert into public.generated_content (
    repository_full_name,
    blog_title,
    blog_description,
    blog_body,
    blog_tags,
    twitter_content,
    linkedin_content,
    facebook_content,
    telegram_summary
) values (
    'test/repo-long',
    'Very Long Title That Could Potentially Be Used In A Blog Post',
    'This is a very long description that could be used for SEO purposes and should be able to handle quite a bit of text without any issues',
    repeat('This is a very long blog post body that contains a lot of text. ', 100),
    array['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'],
    'This is a long Twitter post that should fit within the character limit but still be quite substantial in length',
    repeat('This is a very long LinkedIn post that contains professional content. ', 20),
    repeat('This is a long Facebook post with engaging content. ', 15),
    repeat('This is a long Telegram summary. ', 10)
);

select ok(
    (select count(*) from public.generated_content where repository_full_name = 'test/repo-long') = 1,
    'Should handle very long text content'
);

-- Test 7: Test special characters and unicode
insert into public.generated_content (
    repository_full_name,
    blog_title,
    blog_description,
    blog_body,
    blog_tags,
    twitter_content,
    linkedin_content,
    facebook_content,
    telegram_summary
) values (
    'test/repo-unicode',
    'Test Unicode: 🚀 🎉 💻 ✨',
    'Description with émojis and spéciál characters: àáâãäåæçèéêë',
    'Blog body with unicode: 中文 日本語 한국어 العربية русский',
    array['unicode🚀', 'special-chars', 'émojis✨'],
    'Twitter with unicode: 🐦 Tweet with émojis',
    'LinkedIn: Professional post with spéciál characters',
    'Facebook: Social post with 🎉 celebrations',
    'Telegram: Summary with 📱 mobile content'
);

select ok(
    (select count(*) from public.generated_content where repository_full_name = 'test/repo-unicode') = 1,
    'Should handle unicode characters and emojis'
);

-- Test 8: Test timestamp handling
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
) values (
    'test/repo-timestamp',
    'Test Timestamp',
    'Test Description',
    'Test Body',
    array['test'],
    'Test Twitter',
    'Test LinkedIn',
    'Test Facebook',
    'Test Telegram',
    '2024-01-01T12:00:00Z'::timestamptz
);

select ok(
    (select generation_timestamp from public.generated_content where repository_full_name = 'test/repo-timestamp') = '2024-01-01T12:00:00Z'::timestamptz,
    'Should handle explicit timestamp values'
);

-- Test 9: Test repository name variations
insert into public.generated_content (
    repository_full_name,
    blog_title,
    blog_description,
    blog_body,
    blog_tags,
    twitter_content,
    linkedin_content,
    facebook_content,
    telegram_summary
) values 
    ('org-name/repo-name', 'Test Hyphen', 'Test', 'Test', array['test'], 'Test', 'Test', 'Test', 'Test'),
    ('org_name/repo_name', 'Test Underscore', 'Test', 'Test', array['test'], 'Test', 'Test', 'Test', 'Test'),
    ('org.name/repo.name', 'Test Dot', 'Test', 'Test', array['test'], 'Test', 'Test', 'Test', 'Test'),
    ('123org/456repo', 'Test Numbers', 'Test', 'Test', array['test'], 'Test', 'Test', 'Test', 'Test');

select ok(
    (select count(*) from public.generated_content where repository_full_name like '%/%') = 
    (select count(*) from public.generated_content),
    'Should handle various repository name formats'
);

-- Test 10: Test activity_logs with various event types and sources
insert into public.activity_logs (
    event_type,
    source,
    user_id,
    metadata
) values 
    ('push', 'github', 'user1', '{"commits": 5}'::jsonb),
    ('pull_request', 'github', 'user2', '{"action": "opened"}'::jsonb),
    ('message', 'telegram', 'user3', '{"chat_id": "123"}'::jsonb),
    ('webhook', 'custom', 'user4', '{"custom_data": true}'::jsonb);

select ok(
    (select count(distinct event_type) from public.activity_logs) >= 4,
    'Should handle various event types'
);

select ok(
    (select count(distinct source) from public.activity_logs) >= 3,
    'Should handle various sources'
);

-- Test 11: Test edge case with empty metadata
insert into public.activity_logs (
    event_type,
    source,
    user_id,
    metadata
) values (
    'empty_metadata',
    'test',
    'user5',
    '{}'::jsonb
);

select ok(
    (select metadata from public.activity_logs where event_type = 'empty_metadata') = '{}'::jsonb,
    'Should handle empty JSONB metadata'
);

-- Test 12: Test null user_id (anonymous events)
insert into public.activity_logs (
    event_type,
    source,
    user_id,
    metadata
) values (
    'anonymous_event',
    'web',
    null,
    '{"anonymous": true}'::jsonb
);

select ok(
    (select user_id from public.activity_logs where event_type = 'anonymous_event') is null,
    'Should handle null user_id for anonymous events'
);

-- Clean up
delete from public.generated_content;
delete from public.activity_logs;

select * from finish();
rollback;
