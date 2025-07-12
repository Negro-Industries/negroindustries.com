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

-- Sample data for testing (optional - can be removed in production)
insert into generated_content (
  repository_full_name,
  commit_sha,
  commit_message,
  blog_title,
  blog_description,
  blog_body,
  blog_tags,
  twitter_content,
  linkedin_content,
  facebook_content,
  telegram_summary,
  source_diff,
  generation_model
) values (
  'example/test-repo',
  'abc123def456',
  'Update changelog with new features',
  'Test Repository Update: New Features Added',
  'Discover the latest updates and improvements in our test repository with enhanced functionality and bug fixes.',
  '# Test Repository Update: New Features Added

We''ve just released exciting new updates to our test repository! Our development team has been working hard to bring you improvements and new features.

## What''s New

- Enhanced user interface
- Improved performance
- Bug fixes and stability improvements
- New API endpoints

## Get Started

Check out the [full changelog](https://github.com/example/test-repo/blob/main/CHANGELOG.md) for detailed information about all the changes.

---

*Want to contribute? Visit our [GitHub repository](https://github.com/example/test-repo) and join our community!*',
  array['development', 'update', 'changelog', 'features', 'github'],
  '🚀 Just released new updates to test-repo! Enhanced UI, better performance, and bug fixes. Check it out! #development #update #opensource https://github.com/example/test-repo',
  'Exciting news! We''ve just released new updates to our test repository. Our team has implemented several enhancements including improved UI, better performance, and important bug fixes. These updates represent our commitment to continuous improvement and delivering the best experience for our users. Visit our GitHub repository to explore the changes and see how they can benefit your projects.',
  '🎉 New updates are live for our test repository! We''ve implemented UI enhancements, performance improvements, and critical bug fixes. Our development team has been working hard to bring you these improvements. Check out our GitHub repository to see all the latest changes and how they can enhance your development experience!',
  '🔄 *CHANGELOG Update*

📁 *Repository:* [example/test-repo](https://github.com/example/test-repo)
📄 *File:* [CHANGELOG.md](https://github.com/example/test-repo/blob/main/CHANGELOG.md)
⏰ *Updated:* Jan 11, 2025, 11:47 PM UTC
🔗 *Commit:* [abc123d](https://github.com/example/test-repo/commit/abc123def456)
💬 *Message:* Update changelog with new features

📝 *Blog Post Generated:* Test Repository Update: New Features Added
🔗 *Social Media Posts:* Ready for Twitter, LinkedIn & Facebook

📊 *Content Summary:*
Discover the latest updates and improvements in our test repository with enhanced functionality and bug fixes.

🏷️ *Tags:* development, update, changelog, features, github

🔍 [View Changelog](https://github.com/example/test-repo/blob/main/CHANGELOG.md) | [View Repository](https://github.com/example/test-repo)',
  '+ ## New Features\n+ - Enhanced user interface\n+ - Improved performance\n+ - New API endpoints\n+ \n+ ## Bug Fixes\n+ - Fixed memory leak in data processing\n+ - Resolved authentication timeout issues',
  'meta-llama/llama-4-maverick-17b-128e-instruct'
);
