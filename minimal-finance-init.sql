-- Minimal Finance Module Initialization
-- Run this in Supabase SQL Editor after applying finance-module-migration.sql
-- This is the safest, most minimal version

-- Step 1: Initialize default categories for all existing users
DO $$
DECLARE
    user_record RECORD;
    category_count INTEGER;
BEGIN
    FOR user_record IN SELECT id FROM profiles LOOP
        -- Check if user already has categories
        SELECT COUNT(*) INTO category_count 
        FROM categories 
        WHERE user_id = user_record.id;
        
        -- Only create categories if user has none
        IF category_count = 0 THEN
            PERFORM create_default_categories(user_record.id);
        END IF;
    END LOOP;
END $$;

-- Step 2: Migrate existing transaction categories
SELECT migrate_transaction_categories();

-- Step 3: Simple verification (just count tables)
SELECT 'Categories created' as status, COUNT(*) as count FROM categories;
SELECT 'Transactions total' as status, COUNT(*) as count FROM transactions;

-- Done! Your finance module is now initialized.
