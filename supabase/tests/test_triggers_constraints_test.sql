-- Test triggers and constraints
-- This test ensures triggers fire correctly and constraints are enforced

begin;

-- Load the TAP functions
select plan(18);

-- Clean up any existing data first
delete from public.generated_content;
delete from public.activity_logs;

-- Test 1: Check that triggers exist
select ok(
    (select count(*) from pg_trigger where tgname = 'update_generated_content_updated_at_trigger') = 1,
    'generated_content update trigger should exist'
);

select ok(
    (select count(*) from pg_trigger where tgname = 'update_activity_logs_updated_at') = 1,
    'activity_logs update trigger should exist'
);

-- Test 2: Check that primary key constraints exist
select ok(
    (select count(*) from information_schema.table_constraints 
     where table_name = 'generated_content' and constraint_type = 'PRIMARY KEY') = 1,
    'generated_content should have primary key constraint'
);

select ok(
    (select count(*) from information_schema.table_constraints 
     where table_name = 'activity_logs' and constraint_type = 'PRIMARY KEY') = 1,
    'activity_logs should have primary key constraint'
);

-- Test 3: Check that NOT NULL constraints exist for required fields
select ok(
    (select is_nullable from information_schema.columns 
     where table_name = 'generated_content' and column_name = 'repository_full_name') = 'NO',
    'repository_full_name should be NOT NULL'
);

select ok(
    (select is_nullable from information_schema.columns 
     where table_name = 'generated_content' and column_name = 'blog_title') = 'NO',
    'blog_title should be NOT NULL'
);

select ok(
    (select is_nullable from information_schema.columns 
     where table_name = 'activity_logs' and column_name = 'event_type') = 'NO',
    'event_type should be NOT NULL'
);

select ok(
    (select is_nullable from information_schema.columns 
     where table_name = 'activity_logs' and column_name = 'source') = 'NO',
    'source should be NOT NULL'
);

-- Test 4: Test that default values are set correctly
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
    'test-org/test-repo',
    'Test Title',
    'Test Description',
    'Test Body',
    array['test'],
    'Test Twitter',
    'Test LinkedIn',
    'Test Facebook',
    'Test Telegram'
);

-- Test 5: Verify default values are set
select ok(
    (select id from public.generated_content where repository_full_name = 'test-org/test-repo') is not null,
    'ID should be auto-generated'
);

select ok(
    (select content_type from public.generated_content where repository_full_name = 'test-org/test-repo') = 'changelog_analysis',
    'content_type should default to changelog_analysis'
);

select ok(
    (select blog_tags from public.generated_content where repository_full_name = 'test-org/test-repo') = array['test'],
    'blog_tags should be set as array'
);

select ok(
    (select created_at from public.generated_content where repository_full_name = 'test-org/test-repo') is not null,
    'created_at should be auto-set'
);

select ok(
    (select updated_at from public.generated_content where repository_full_name = 'test-org/test-repo') is not null,
    'updated_at should be auto-set'
);

-- Test 6: Test that the update trigger works
-- Store the initial updated_at value
create temporary table temp_initial_values as
select updated_at as initial_updated_at from public.generated_content where repository_full_name = 'test-org/test-repo';

select pg_sleep(1);

update public.generated_content 
set blog_title = 'Updated Title'
where repository_full_name = 'test-org/test-repo';

select ok(
    (select gc.updated_at > tiv.initial_updated_at 
     from public.generated_content gc, temp_initial_values tiv 
     where gc.repository_full_name = 'test-org/test-repo'),
    'updated_at should be updated by trigger'
);

-- Test 7: Test activity_logs defaults and trigger
insert into public.activity_logs (
    event_type,
    source,
    user_id,
    metadata
) values (
    'test_event',
    'test_source',
    'test_user',
    '{"test": "data"}'::jsonb
);

select ok(
    (select id from public.activity_logs where event_type = 'test_event') is not null,
    'Activity log ID should be auto-generated'
);

select ok(
    (select timestamp from public.activity_logs where event_type = 'test_event') is not null,
    'Activity log timestamp should be auto-set'
);

select ok(
    (select created_at from public.activity_logs where event_type = 'test_event') is not null,
    'Activity log created_at should be auto-set'
);

-- Test 8: Test activity_logs update trigger
create temporary table temp_activity_initial as
select updated_at as initial_updated_at from public.activity_logs where event_type = 'test_event';

select pg_sleep(1);

update public.activity_logs 
set metadata = '{"test": "updated"}'::jsonb
where event_type = 'test_event';

select ok(
    (select al.updated_at > tai.initial_updated_at 
     from public.activity_logs al, temp_activity_initial tai 
     where al.event_type = 'test_event'),
    'Activity log updated_at should be updated by trigger'
);

-- Clean up
delete from public.generated_content;
delete from public.activity_logs;

select * from finish();
rollback;
