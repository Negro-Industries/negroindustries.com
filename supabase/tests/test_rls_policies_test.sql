-- Test RLS policies
-- This test ensures RLS policies work correctly for different user types

begin;

-- Load the TAP functions
select plan(12);

-- Test 1: Check that RLS is enabled on generated_content table
select ok(
    (select relrowsecurity from pg_class where relname = 'generated_content') = true,
    'RLS should be enabled on generated_content table'
);

-- Test 2: Check that RLS is enabled on activity_logs table
select ok(
    (select relrowsecurity from pg_class where relname = 'activity_logs') = true,
    'RLS should be enabled on activity_logs table'
);

-- Test 3: Check that generated_content policies exist
select ok(
    (select count(*) from pg_policies where tablename = 'generated_content' and policyname = 'Allow read access for all users') = 1,
    'Read policy should exist for generated_content'
);

select ok(
    (select count(*) from pg_policies where tablename = 'generated_content' and policyname = 'Allow insert for authenticated users') = 1,
    'Insert policy should exist for generated_content'
);

select ok(
    (select count(*) from pg_policies where tablename = 'generated_content' and policyname = 'Allow update for authenticated users') = 1,
    'Update policy should exist for generated_content'
);

select ok(
    (select count(*) from pg_policies where tablename = 'generated_content' and policyname = 'Allow delete for authenticated users') = 1,
    'Delete policy should exist for generated_content'
);

-- Test 4: Check that activity_logs policies exist
select ok(
    (select count(*) from pg_policies where tablename = 'activity_logs' and policyname = 'Allow all operations for authenticated users') = 1,
    'Authenticated users policy should exist for activity_logs'
);

select ok(
    (select count(*) from pg_policies where tablename = 'activity_logs' and policyname = 'Allow read access for anonymous users') = 1,
    'Anonymous read policy should exist for activity_logs'
);

-- Test 5: Test that policies have correct permissions
select ok(
    (select cmd from pg_policies where tablename = 'generated_content' and policyname = 'Allow read access for all users') = 'SELECT',
    'Read policy should be for SELECT operations'
);

select ok(
    (select cmd from pg_policies where tablename = 'generated_content' and policyname = 'Allow insert for authenticated users') = 'INSERT',
    'Insert policy should be for INSERT operations'
);

select ok(
    (select cmd from pg_policies where tablename = 'generated_content' and policyname = 'Allow update for authenticated users') = 'UPDATE',
    'Update policy should be for UPDATE operations'
);

select ok(
    (select cmd from pg_policies where tablename = 'generated_content' and policyname = 'Allow delete for authenticated users') = 'DELETE',
    'Delete policy should be for DELETE operations'
);

-- Note: We cannot easily test the actual RLS enforcement in pgTAP without setting up
-- different user contexts, but we can verify the policies are correctly defined

select * from finish();
rollback;
