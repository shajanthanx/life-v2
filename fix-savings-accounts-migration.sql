-- FIX SAVINGS GOALS ACCOUNT CONSTRAINT
-- This script fixes the account field in savings_goals to use UUIDs instead of strings
-- Run this SQL in your Supabase SQL editor to fix the current constraint error

-- =====================================================
-- FIX ACCOUNT COLUMN IN SAVINGS_GOALS
-- =====================================================

-- Step 1: Drop the problematic check constraint
ALTER TABLE savings_goals DROP CONSTRAINT IF EXISTS savings_goals_account_check;

-- Step 2: Drop the old account column (this will lose existing account data)
ALTER TABLE savings_goals DROP COLUMN IF EXISTS account;

-- Step 3: Add new account column as UUID foreign key to user_accounts
ALTER TABLE savings_goals ADD COLUMN account UUID REFERENCES user_accounts(id) ON DELETE SET NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check the updated column structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'savings_goals' 
  AND table_schema = 'public'
  AND column_name = 'account';

-- Check constraints on savings_goals table
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'savings_goals' 
  AND table_schema = 'public';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Savings Goals account constraint FIXED!';
    RAISE NOTICE '🔗 Account column now references user_accounts table';
    RAISE NOTICE '💾 You can now use account UUIDs from user_accounts';
    RAISE NOTICE '⚠️  Note: Existing account values were reset to NULL';
END $$;
