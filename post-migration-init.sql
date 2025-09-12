-- Post-Migration Initialization Script
-- Run this in Supabase SQL Editor after applying finance-module-migration.sql

-- 1. Initialize default categories for all existing users
-- This will call the create_default_categories function for each user profile
DO $$
DECLARE
    user_record RECORD;
    category_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting category initialization for existing users...';
    
    FOR user_record IN SELECT id FROM profiles LOOP
        -- Check if user already has categories
        SELECT COUNT(*) INTO category_count 
        FROM categories 
        WHERE user_id = user_record.id;
        
        IF category_count = 0 THEN
            -- Create default categories for this user
            PERFORM create_default_categories(user_record.id);
            RAISE NOTICE 'Created default categories for user: %', user_record.id;
        ELSE
            RAISE NOTICE 'User % already has % categories, skipping', user_record.id, category_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Category initialization completed!';
END $$;

-- 2. Run the transaction category migration
-- This converts existing text categories to category_id references
SELECT migrate_transaction_categories();

-- 3. Verification queries
-- Check that everything worked correctly

-- Show category counts by user
SELECT 
    'Category Summary' as info,
    COUNT(*) as total_categories,
    COUNT(DISTINCT user_id) as users_with_categories
FROM categories;

-- Show sample categories
SELECT 
    'Sample Categories' as info,
    name,
    type,
    icon,
    is_default
FROM categories 
WHERE is_default = true
ORDER BY type, name
LIMIT 10;

-- Show transactions with category_id
SELECT 
    'Transaction Migration Status' as info,
    COUNT(*) as total_transactions,
    COUNT(category_id) as transactions_with_category_id,
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(COUNT(category_id) * 100.0 / COUNT(*), 2)
    END as migration_percentage
FROM transactions;

-- Show sample migrated transactions
SELECT 
    'Sample Migrated Transactions' as info,
    t.id,
    t.category as legacy_category,
    c.name as new_category_name,
    c.type as category_type
FROM transactions t
JOIN categories c ON t.category_id = c.id
LIMIT 5;

-- Post-migration initialization completed successfully!
-- Your finance module is now ready to use with all new features.

-- Final verification message
DO $$
BEGIN
    RAISE NOTICE 'Post-migration initialization completed successfully!';
    RAISE NOTICE 'Your finance module is now ready to use with all new features.';
END $$;
