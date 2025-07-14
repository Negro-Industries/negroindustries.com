-- Create activity_logs table
-- This table stores all activity logs from various sources (GitHub, Telegram, etc.)

-- Create the activity_logs table
create table if not exists activity_logs (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz not null default now(),
  event_type varchar(100) not null,
  source varchar(50) not null,
  user_id varchar(100),
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table activity_logs is 'Stores all activity logs from various sources (GitHub, Telegram, etc.)';

-- Create indexes for better query performance
create index if not exists idx_activity_logs_timestamp on activity_logs(timestamp desc);
create index if not exists idx_activity_logs_event_type on activity_logs(event_type);
create index if not exists idx_activity_logs_source on activity_logs(source);
create index if not exists idx_activity_logs_user_id on activity_logs(user_id);

-- Create a function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger 
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger to automatically update updated_at
create trigger update_activity_logs_updated_at 
  before update on activity_logs 
  for each row 
  execute function update_updated_at_column();

-- Enable Row Level Security (RLS)
alter table activity_logs enable row level security;

-- Create RLS policies for activity_logs
create policy "Allow all operations for authenticated users" on activity_logs
  for all 
  to authenticated
  using (true)
  with check (true);

create policy "Allow read access for anonymous users" on activity_logs
  for select 
  to anon
  using (true);
