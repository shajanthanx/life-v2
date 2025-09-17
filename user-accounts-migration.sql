-- USER ACCOUNTS TABLE MIGRATION
-- This script creates the user_accounts table for user-defined accounts
-- Run this SQL in your Supabase SQL editor

-- =====================================================
-- USER ACCOUNTS TABLE
-- =====================================================

-- Create user_accounts table
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'credit', 'cash', 'crypto', 'other')),
    balance DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on user_accounts table
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own accounts" ON user_accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON user_accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON user_accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON user_accounts;

-- Create new policies
CREATE POLICY "Users can view their own accounts" ON user_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON user_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON user_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON user_accounts FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE PERFORMANCE INDEXES
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_type ON user_accounts(type);
CREATE INDEX IF NOT EXISTS idx_user_accounts_is_active ON user_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_user_accounts_created_at ON user_accounts(created_at);

-- =====================================================
-- CREATE UPDATE TRIGGER
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_accounts_updated_at ON user_accounts;

-- Create trigger for user_accounts
CREATE TRIGGER update_user_accounts_updated_at 
    BEFORE UPDATE ON user_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT ACCOUNTS FOR EXISTING USERS
-- =====================================================

-- Function to create default accounts for a user
CREATE OR REPLACE FUNCTION create_default_accounts_for_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO user_accounts (user_id, name, type, description) VALUES
        (user_uuid, 'Main Checking', 'checking', 'Primary checking account'),
        (user_uuid, 'Savings Account', 'savings', 'Main savings account'),
        (user_uuid, 'Cash Wallet', 'cash', 'Physical cash on hand')
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

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
WHERE table_name = 'user_accounts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'user_accounts';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ User Accounts table migration SUCCESSFUL!';
    RAISE NOTICE '💰 Created user_accounts table with balance tracking';
    RAISE NOTICE '🔒 Row Level Security policies applied';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🔄 Auto-update trigger for updated_at created';
    RAISE NOTICE '🚀 Ready for user-defined accounts!';
END $$;
