-- Generated Content Table
-- This table stores all AI-generated content from changelog analysis

create table if not exists generated_content (
  id uuid default gen_random_uuid() primary key,
  repository_full_name text not null,
  commit_sha text,
  commit_message text,
  content_type text not null default 'changelog_analysis',
  
  -- Blog post content
  blog_title text not null,
  blog_description text not null,
  blog_body text not null,
  blog_tags text[] not null default '{}',
  
  -- Social media content
  twitter_content text not null,
  linkedin_content text not null,
  facebook_content text not null,
  
  -- Telegram summary
  telegram_summary text not null,
  
  -- Metadata
  source_diff text,
  generation_model text,
  generation_timestamp timestamptz not null default now(),
  
  -- Audit fields
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table generated_content is 'Stores AI-generated content from GitHub changelog analysis including blog posts, social media content, and summaries';

-- Create indexes for better query performance
create index if not exists idx_generated_content_repository on generated_content(repository_full_name);
create index if not exists idx_generated_content_timestamp on generated_content(generation_timestamp desc);
create index if not exists idx_generated_content_content_type on generated_content(content_type);
create index if not exists idx_generated_content_commit_sha on generated_content(commit_sha);

-- Create a function to automatically update the updated_at timestamp
create or replace function update_generated_content_updated_at()
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
create trigger update_generated_content_updated_at_trigger
  before update on generated_content
  for each row
  execute function update_generated_content_updated_at();

-- Enable Row Level Security (RLS)
alter table generated_content enable row level security;

-- Create RLS policies
create policy "Allow read access for all users" on generated_content
  for select
  to authenticated, anon
  using (true);

create policy "Allow insert for authenticated users" on generated_content
  for insert
  to authenticated
  with check (true);

create policy "Allow update for authenticated users" on generated_content
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow delete for authenticated users" on generated_content
  for delete
  to authenticated
  using (true);

-- Create a view for easy content retrieval with formatted data
create or replace view generated_content_summary as
select
  id,
  repository_full_name,
  commit_sha,
  blog_title,
  blog_description,
  array_length(blog_tags, 1) as tag_count,
  content_type,
  generation_timestamp,
  created_at
from generated_content
order by generation_timestamp desc;

comment on view generated_content_summary is 'Simplified view of generated content for dashboard and listing purposes';
