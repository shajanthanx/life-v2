-- Simple Post-Migration Initialization Script
-- Run this in Supabase SQL Editor after applying finance-module-migration.sql
-- This version has no RAISE NOTICE statements to avoid any syntax issues

-- 1. Initialize default categories for all existing users
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
        
        IF category_count = 0 THEN
            -- Create default categories for this user
            PERFORM create_default_categories(user_record.id);
        END IF;
    END LOOP;
END $$;

-- 2. Run the transaction category migration
SELECT migrate_transaction_categories();

-- 3. Verification queries (check the results in the output)

-- Category counts by user
SELECT 
    'RESULT: Category Summary' as status,
    COUNT(*) as total_categories,
    COUNT(DISTINCT user_id) as users_with_categories
FROM categories;

-- Transaction migration status
SELECT 
    'RESULT: Migration Status' as status,
    COUNT(*) as total_transactions,
    COUNT(category_id) as transactions_with_category_id,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(COUNT(category_id) * 100.0 / COUNT(*), 2)
    END as migration_percentage
FROM transactions;

-- Sample categories created
SELECT 
    'RESULT: Sample Categories' as status,
    name,
    type,
    icon,
    is_default
FROM categories 
WHERE is_default = true
ORDER BY type, name
LIMIT 8;

-- Sample migrated transactions
SELECT 
    'RESULT: Sample Migrated Transactions' as status,
    t.category as old_category,
    c.name as new_category,
    c.type
FROM transactions t
JOIN categories c ON t.category_id = c.id
LIMIT 3;
