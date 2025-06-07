-- Activity Logs Table
-- This table stores all activity logs from various sources (GitHub, Telegram, etc.)

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  user_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_source ON activity_logs(source);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_activity_logs_updated_at 
  BEFORE UPDATE ON activity_logs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- Note: You may want to customize this based on your authentication setup
CREATE POLICY "Allow all operations for authenticated users" ON activity_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create a policy for anonymous users to read logs (if needed for public dashboard)
CREATE POLICY "Allow read access for anonymous users" ON activity_logs
  FOR SELECT USING (true);

-- Sample data for testing (optional)
INSERT INTO activity_logs (event_type, source, user_id, metadata) VALUES
  ('push', 'github', 'user123', '{"repository": "test-repo", "branch": "main", "commits": 3}'),
  ('message', 'telegram', 'user456', '{"chat_id": "123456", "message": "Hello World"}'),
  ('webhook', 'github', 'user123', '{"action": "opened", "pull_request": {"number": 42}}'); 