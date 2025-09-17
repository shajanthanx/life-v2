-- SAVINGS GOALS TABLE MIGRATION
-- This script creates the savings_goals table with the updated schema
-- Run this SQL in your Supabase SQL editor

-- =====================================================
-- SAVINGS GOALS TABLE
-- =====================================================

-- Create savings_goals table if it doesn't exist or update existing one
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE,
    description TEXT,
    account UUID REFERENCES user_accounts(id) ON DELETE SET NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- If table already exists, add new columns
DO $$
BEGIN
    -- Add target_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'savings_goals' AND column_name = 'target_date') THEN
        ALTER TABLE savings_goals ADD COLUMN target_date DATE;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'savings_goals' AND column_name = 'description') THEN
        ALTER TABLE savings_goals ADD COLUMN description TEXT;
    END IF;
    
    -- Update account column to use UUID foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'savings_goals' AND column_name = 'account' AND data_type = 'text') THEN
        -- Drop the old check constraint if it exists
        ALTER TABLE savings_goals DROP CONSTRAINT IF EXISTS savings_goals_account_check;
        
        -- Drop the old account column
        ALTER TABLE savings_goals DROP COLUMN IF EXISTS account;
        
        -- Add new account column as UUID foreign key
        ALTER TABLE savings_goals ADD COLUMN account UUID REFERENCES user_accounts(id) ON DELETE SET NULL;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'savings_goals' AND column_name = 'account') THEN
        -- Add account column if it doesn't exist at all
        ALTER TABLE savings_goals ADD COLUMN account UUID REFERENCES user_accounts(id) ON DELETE SET NULL;
    END IF;
    
    -- Remove deadline column if it exists (replaced by target_date)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'savings_goals' AND column_name = 'deadline') THEN
        ALTER TABLE savings_goals DROP COLUMN deadline;
    END IF;
END $$;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on savings_goals table
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete their own savings goals" ON savings_goals;

-- Create new policies
CREATE POLICY "Users can view their own savings goals" ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings goals" ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings goals" ON savings_goals FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE PERFORMANCE INDEXES
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_is_completed ON savings_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_savings_goals_target_date ON savings_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_savings_goals_account ON savings_goals(account);
CREATE INDEX IF NOT EXISTS idx_savings_goals_created_at ON savings_goals(created_at);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'savings_goals' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'savings_goals';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Savings Goals table migration SUCCESSFUL!';
    RAISE NOTICE '🎯 Updated schema with target_date, description, and account fields';
    RAISE NOTICE '🔒 Row Level Security policies applied';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🚀 Ready for savings goals functionality!';
END $$;
