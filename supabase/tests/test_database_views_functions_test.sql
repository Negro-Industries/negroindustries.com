-- Test database views and functions
-- This test ensures views and functions work correctly for dashboard display

begin;

-- Load the TAP functions
select plan(18);

-- Clean up any existing data first
delete from public.generated_content;

-- Test 1: Check that the generated_content_summary view exists
select has_view('public', 'generated_content_summary', 'generated_content_summary view should exist');

-- Test 2: Check that the update functions exist
select has_function('public', 'update_updated_at_column', 'update_updated_at_column function should exist');
select has_function('public', 'update_generated_content_updated_at', 'update_generated_content_updated_at function should exist');

-- Test 3: Insert test data to test the view
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
    generation_timestamp
) values 
    ('test-org/repo1', 'abc123', 'Test commit 1', 'changelog_analysis', 'Blog Title 1', 'Blog Description 1', 'Blog Body 1', array['tag1', 'tag2'], 'Twitter 1', 'LinkedIn 1', 'Facebook 1', 'Telegram 1', now()),
    ('test-org/repo2', 'def456', 'Test commit 2', 'changelog_analysis', 'Blog Title 2', 'Blog Description 2', 'Blog Body 2', array['tag3', 'tag4', 'tag5'], 'Twitter 2', 'LinkedIn 2', 'Facebook 2', 'Telegram 2', now() - interval '1 day');

-- Test 4: Test that the view returns data
select ok(
    (select count(*) from public.generated_content_summary) = 2,
    'View should return all generated content records'
);

-- Test 5: Test that the view includes required columns
select has_column('public', 'generated_content_summary', 'id', 'View should have id column');
select has_column('public', 'generated_content_summary', 'repository_full_name', 'View should have repository_full_name column');
select has_column('public', 'generated_content_summary', 'commit_sha', 'View should have commit_sha column');
select has_column('public', 'generated_content_summary', 'blog_title', 'View should have blog_title column');
select has_column('public', 'generated_content_summary', 'blog_description', 'View should have blog_description column');
select has_column('public', 'generated_content_summary', 'tag_count', 'View should have tag_count column');
select has_column('public', 'generated_content_summary', 'content_type', 'View should have content_type column');
select has_column('public', 'generated_content_summary', 'generation_timestamp', 'View should have generation_timestamp column');
select has_column('public', 'generated_content_summary', 'created_at', 'View should have created_at column');

-- Test 6: Test that tag_count is calculated correctly
select ok(
    (select tag_count from public.generated_content_summary where repository_full_name = 'test-org/repo1') = 2,
    'View should correctly calculate tag count for repo1'
);

select ok(
    (select tag_count from public.generated_content_summary where repository_full_name = 'test-org/repo2') = 3,
    'View should correctly calculate tag count for repo2'
);

-- Test 7: Test that the view orders by generation_timestamp desc
select ok(
    (select repository_full_name from public.generated_content_summary order by generation_timestamp desc limit 1) = 'test-org/repo1',
    'View should order by generation_timestamp descending'
);

-- Test 8: Test the update trigger function
-- First, get the current updated_at value
select ok(
    (select updated_at from public.generated_content where repository_full_name = 'test-org/repo1') is not null,
    'updated_at should be set on insert'
);

-- Store the initial updated_at value
create temporary table temp_initial_values as
select updated_at as initial_updated_at from public.generated_content where repository_full_name = 'test-org/repo1';

-- Wait a moment and update the record to test the trigger
select pg_sleep(1);

update public.generated_content 
set blog_title = 'Updated Blog Title 1'
where repository_full_name = 'test-org/repo1';

-- Test that updated_at was changed by the trigger
select ok(
    (select gc.updated_at > tiv.initial_updated_at 
     from public.generated_content gc, temp_initial_values tiv 
     where gc.repository_full_name = 'test-org/repo1'),
    'updated_at should be updated by trigger on record update'
);

-- Clean up
delete from public.generated_content;

select * from finish();
rollback;
