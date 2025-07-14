-- Test activity logs table CRUD operations
-- This test ensures agents can log activities and dashboard can display them properly

begin;

-- Load the TAP functions
select plan(20);

-- Clean up any existing data first
delete from public.activity_logs;

-- Test 1: Check that the activity_logs table exists
select has_table('public', 'activity_logs', 'activity_logs table should exist');

-- Test 2: Check that all required columns exist
select has_column('public', 'activity_logs', 'id', 'id column should exist');
select has_column('public', 'activity_logs', 'timestamp', 'timestamp column should exist');
select has_column('public', 'activity_logs', 'event_type', 'event_type column should exist');
select has_column('public', 'activity_logs', 'source', 'source column should exist');
select has_column('public', 'activity_logs', 'user_id', 'user_id column should exist');
select has_column('public', 'activity_logs', 'metadata', 'metadata column should exist');
select has_column('public', 'activity_logs', 'created_at', 'created_at column should exist');
select has_column('public', 'activity_logs', 'updated_at', 'updated_at column should exist');

-- Test 3: Test INSERT operation (agent logging activity)
insert into public.activity_logs (
    timestamp,
    event_type,
    source,
    user_id,
    metadata
) values (
    now(),
    'push',
    'github',
    'user123',
    '{"repository": "test-repo", "branch": "main", "commits": 3}'::jsonb
);

-- Test 4: Verify the insert worked
select ok(
    (select count(*) from public.activity_logs where event_type = 'push') = 1,
    'Activity log should be inserted successfully'
);

-- Test 5: Test SELECT operation (dashboard displaying logs)
select ok(
    (select source from public.activity_logs where event_type = 'push') = 'github',
    'Should be able to read activity log source'
);

-- Test 6: Test JSONB metadata functionality
select ok(
    (select metadata->>'repository' from public.activity_logs where event_type = 'push') = 'test-repo',
    'Should be able to query JSONB metadata'
);

-- Test 7: Test UPDATE operation
update public.activity_logs 
set metadata = '{"repository": "updated-repo", "branch": "develop", "commits": 5}'::jsonb
where event_type = 'push';

select ok(
    (select metadata->>'repository' from public.activity_logs where event_type = 'push') = 'updated-repo',
    'Should be able to update activity log metadata'
);

-- Test 8: Test DELETE operation
delete from public.activity_logs where event_type = 'push';

select ok(
    (select count(*) from public.activity_logs where event_type = 'push') = 0,
    'Should be able to delete activity logs'
);

-- Test 9: Test multiple inserts for different sources and event types
insert into public.activity_logs (
    timestamp,
    event_type,
    source,
    user_id,
    metadata
) values 
    (now() - interval '1 hour', 'push', 'github', 'user123', '{"repository": "repo1", "branch": "main"}'::jsonb),
    (now() - interval '2 hours', 'message', 'telegram', 'user456', '{"chat_id": "123456", "message": "Hello"}'::jsonb),
    (now() - interval '3 hours', 'webhook', 'github', 'user789', '{"action": "opened", "pull_request": {"number": 42}}'::jsonb);

select ok(
    (select count(*) from public.activity_logs) = 3,
    'Should be able to insert multiple activity logs'
);

-- Test 10: Test filtering by source (dashboard functionality)
select ok(
    (select count(*) from public.activity_logs where source = 'github') = 2,
    'Should be able to filter logs by source'
);

-- Test 11: Test filtering by event_type (dashboard functionality)
select ok(
    (select count(*) from public.activity_logs where event_type = 'push') = 1,
    'Should be able to filter logs by event_type'
);

-- Test 12: Test ordering by timestamp (dashboard default order)
select ok(
    (select event_type from public.activity_logs order by timestamp desc limit 1) = 'push',
    'Should order by timestamp descending'
);

-- Test 13: Test metadata queries for different sources
select ok(
    (select metadata->>'chat_id' from public.activity_logs where source = 'telegram') = '123456',
    'Should be able to query telegram-specific metadata'
);

-- Test 14: Test user_id filtering (dashboard user-specific logs)
select ok(
    (select count(*) from public.activity_logs where user_id = 'user123') = 1,
    'Should be able to filter logs by user_id'
);

-- Clean up
delete from public.activity_logs;

select * from finish();
rollback;
