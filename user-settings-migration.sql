-- Safe Migration Script for User Settings Table

-- 1. Create the user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  settings_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create unique constraint on user_id to ensure one settings record per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 3. Enable Row Level Security for the user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the user_settings table
-- Drop existing policy if it exists to prevent "policy already exists" error
DROP POLICY IF EXISTS "Users can access own settings" ON user_settings;
CREATE POLICY "Users can access own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- 5. Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Apply the trigger to user_settings table
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert default settings for all existing users (if any)
INSERT INTO user_settings (user_id, settings_data)
SELECT 
  id as user_id,
  '{
    "modules": {
      "enabled": ["goals", "tasks", "habits", "notes", "health", "finance", "lifestyle", "visualization", "gifts", "memories", "freelancing", "secrets", "analytics"]
    },
    "notifications": {
      "taskReminders": true,
      "habitReminders": true,
      "budgetAlerts": true,
      "goalDeadlines": true,
      "dailyReflection": true,
      "gratitudeReminder": true
    },
    "preferences": {
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY",
      "weekStartsOn": "Sunday",
      "darkMode": false,
      "compactView": false,
      "showMotivationalQuotes": true
    },
    "privacy": {
      "dataAnalytics": false,
      "shareProgress": false,
      "publicProfile": false
    }
  }'::jsonb as settings_data
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_settings);

-- 8. Verification: Check if the user_settings table and its columns exist
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_settings'
ORDER BY ordinal_position;
