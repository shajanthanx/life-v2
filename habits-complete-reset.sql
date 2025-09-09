-- ==========================================
-- COMPLETE HABITS SYSTEM RESET
-- ==========================================
-- This script completely removes all habits-related tables and recreates them
-- with the correct simplified schema (boolean completion only)

-- Start transaction for atomic operation
BEGIN;

-- ==========================================
-- STEP 1: DROP ALL EXISTING HABITS TABLES
-- ==========================================
-- Drop all tables including backups and any variations

-- Drop main tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS habit_records CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS bad_habit_records CASCADE;  
DROP TABLE IF EXISTS bad_habits CASCADE;

-- Drop any backup tables that might exist
DROP TABLE IF EXISTS habit_records_backup CASCADE;
DROP TABLE IF EXISTS habits_backup CASCADE;
DROP TABLE IF EXISTS bad_habit_records_backup CASCADE;
DROP TABLE IF EXISTS bad_habits_backup CASCADE;

-- Drop any views related to habits
DROP VIEW IF EXISTS habit_streaks CASCADE;
DROP VIEW IF EXISTS weekly_habit_completion CASCADE;

-- ==========================================
-- STEP 2: CREATE SIMPLIFIED HABITS SCHEMA
-- ==========================================

-- Create habits table (simplified - no target/unit)
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('health', 'productivity', 'mindfulness', 'fitness', 'learning')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit_records table (simplified - boolean completion only)
CREATE TABLE habit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Create bad_habits table (simplified - just track occurrence)
CREATE TABLE bad_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bad_habit_records table (simplified - boolean occurrence)
CREATE TABLE bad_habit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES bad_habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_occurred BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- ==========================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Habits table indexes
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
CREATE INDEX idx_habits_frequency ON habits(frequency);
CREATE INDEX idx_habits_created_at ON habits(created_at DESC);

-- Habit records indexes  
CREATE INDEX idx_habit_records_habit_date ON habit_records(habit_id, date DESC);
CREATE INDEX idx_habit_records_date ON habit_records(date DESC);
CREATE INDEX idx_habit_records_completed ON habit_records(is_completed, date DESC);
CREATE INDEX idx_habit_records_user_date ON habit_records(habit_id, date DESC, is_completed);

-- Bad habits indexes
CREATE INDEX idx_bad_habits_user ON bad_habits(user_id);
CREATE INDEX idx_bad_habit_records_habit_date ON bad_habit_records(habit_id, date DESC);

-- ==========================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habit_records ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 5: CREATE RLS POLICIES
-- ==========================================

-- Habits policies
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON habits;
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- Habit records policies
DROP POLICY IF EXISTS "Users can view own habit records" ON habit_records;
CREATE POLICY "Users can view own habit records" ON habit_records FOR SELECT USING (
  habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own habit records" ON habit_records;
CREATE POLICY "Users can insert own habit records" ON habit_records FOR INSERT WITH CHECK (
  habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update own habit records" ON habit_records;
CREATE POLICY "Users can update own habit records" ON habit_records FOR UPDATE USING (
  habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own habit records" ON habit_records;
CREATE POLICY "Users can delete own habit records" ON habit_records FOR DELETE USING (
  habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
);

-- Bad habits policies
DROP POLICY IF EXISTS "Users can view own bad habits" ON bad_habits;
CREATE POLICY "Users can view own bad habits" ON bad_habits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bad habits" ON bad_habits;
CREATE POLICY "Users can insert own bad habits" ON bad_habits FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bad habits" ON bad_habits;
CREATE POLICY "Users can update own bad habits" ON bad_habits FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bad habits" ON bad_habits;
CREATE POLICY "Users can delete own bad habits" ON bad_habits FOR DELETE USING (auth.uid() = user_id);

-- Bad habit records policies
DROP POLICY IF EXISTS "Users can view own bad habit records" ON bad_habit_records;
CREATE POLICY "Users can view own bad habit records" ON bad_habit_records FOR SELECT USING (
  habit_id IN (SELECT id FROM bad_habits WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own bad habit records" ON bad_habit_records;
CREATE POLICY "Users can insert own bad habit records" ON bad_habit_records FOR INSERT WITH CHECK (
  habit_id IN (SELECT id FROM bad_habits WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update own bad habit records" ON bad_habit_records;
CREATE POLICY "Users can update own bad habit records" ON bad_habit_records FOR UPDATE USING (
  habit_id IN (SELECT id FROM bad_habits WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own bad habit records" ON bad_habit_records;
CREATE POLICY "Users can delete own bad habit records" ON bad_habit_records FOR DELETE USING (
  habit_id IN (SELECT id FROM bad_habits WHERE user_id = auth.uid())
);

-- ==========================================
-- STEP 6: CREATE UPDATED_AT TRIGGER FUNCTION
-- ==========================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at on habits table
DROP TRIGGER IF EXISTS set_habits_updated_at ON habits;
CREATE TRIGGER set_habits_updated_at
BEFORE UPDATE ON habits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- STEP 7: CREATE HELPER VIEWS FOR ANALYTICS
-- ==========================================

-- Create view for habit streaks calculation
CREATE OR REPLACE VIEW habit_streaks AS
WITH daily_completions AS (
  SELECT 
    h.id as habit_id,
    h.name,
    h.user_id,
    hr.date,
    hr.is_completed,
    LAG(hr.date) OVER (PARTITION BY h.id ORDER BY hr.date) as prev_date,
    CASE 
      WHEN LAG(hr.date) OVER (PARTITION BY h.id ORDER BY hr.date) = hr.date - INTERVAL '1 day' THEN 0
      ELSE 1
    END as is_streak_start
  FROM habits h
  LEFT JOIN habit_records hr ON h.id = hr.habit_id
  WHERE h.is_active = true
    AND hr.is_completed = true
    AND hr.date >= CURRENT_DATE - INTERVAL '90 days'
),
streak_groups AS (
  SELECT 
    habit_id,
    name,
    user_id,
    date,
    SUM(is_streak_start) OVER (PARTITION BY habit_id ORDER BY date) as streak_group
  FROM daily_completions
),
streaks AS (
  SELECT 
    habit_id,
    name,
    user_id,
    streak_group,
    COUNT(*) as streak_length,
    MIN(date) as streak_start,
    MAX(date) as streak_end
  FROM streak_groups
  GROUP BY habit_id, name, user_id, streak_group
)
SELECT 
  habit_id,
  name,
  user_id,
  MAX(streak_length) as longest_streak,
  COALESCE(
    MAX(CASE WHEN streak_end >= CURRENT_DATE - INTERVAL '1 day' THEN streak_length END),
    0
  ) as current_streak
FROM streaks
GROUP BY habit_id, name, user_id;

-- Create view for weekly completion rates
CREATE OR REPLACE VIEW weekly_habit_completion AS
SELECT 
  h.id as habit_id,
  h.name,
  h.user_id,
  h.frequency,
  DATE_TRUNC('week', COALESCE(hr.date, CURRENT_DATE))::DATE as week_start,
  COUNT(CASE WHEN hr.is_completed THEN 1 END) as completed_days,
  CASE 
    WHEN h.frequency = 'daily' THEN 7
    WHEN h.frequency = 'weekly' THEN 1
    ELSE 7
  END as target_days,
  CASE 
    WHEN COUNT(CASE WHEN hr.is_completed THEN 1 END) = 0 THEN 0
    ELSE ROUND(
      (COUNT(CASE WHEN hr.is_completed THEN 1 END)::DECIMAL / 
       CASE 
         WHEN h.frequency = 'daily' THEN 7
         WHEN h.frequency = 'weekly' THEN 1
         ELSE 7
       END) * 100, 
      1
    )
  END as completion_percentage
FROM habits h
LEFT JOIN habit_records hr ON h.id = hr.habit_id 
  AND hr.date >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '4 weeks'
WHERE h.is_active = true
GROUP BY h.id, h.name, h.user_id, h.frequency, DATE_TRUNC('week', COALESCE(hr.date, CURRENT_DATE))
ORDER BY week_start DESC;

-- ==========================================
-- STEP 8: INSERT SAMPLE DATA (OPTIONAL)
-- ==========================================
-- Uncomment to add sample habits for testing

/*
-- Sample habits for testing (replace with actual user ID)
INSERT INTO habits (user_id, name, description, category, frequency, color) VALUES
('your-user-id-here', 'Drink Water', 'Stay hydrated throughout the day', 'health', 'daily', '#3b82f6'),
('your-user-id-here', 'Exercise', 'Do some form of physical activity', 'fitness', 'daily', '#ef4444'),
('your-user-id-here', 'Read', 'Read for at least 20 minutes', 'learning', 'daily', '#22c55e'),
('your-user-id-here', 'Meditate', 'Practice mindfulness meditation', 'mindfulness', 'daily', '#8b5cf6');
*/

-- ==========================================
-- STEP 9: VERIFICATION QUERIES
-- ==========================================

-- Verify table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('habits', 'habit_records', 'bad_habits', 'bad_habit_records')
ORDER BY table_name, ordinal_position;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('habits', 'habit_records', 'bad_habits', 'bad_habit_records')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('habits', 'habit_records', 'bad_habits', 'bad_habit_records')
ORDER BY tablename, policyname;

-- Test views
SELECT 'habit_streaks' as view_name, COUNT(*) as row_count FROM habit_streaks
UNION ALL
SELECT 'weekly_habit_completion' as view_name, COUNT(*) as row_count FROM weekly_habit_completion;

COMMIT;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================
SELECT 'Habits system completely reset and recreated successfully!' as status;
