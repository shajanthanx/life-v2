-- Check which tables already exist in your Supabase database
-- Run this to see what's already there vs. what we need

-- Check all tables that should exist for Life Manager v2
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('goals', 'tasks', 'habits', 'journal_entries', 'transactions') THEN '✅ Core API (exists)'
    WHEN table_name IN ('sleep_records', 'exercise_records', 'nutrition_records', 'books', 'movies') THEN '✅ Secondary API (exists)'
    WHEN table_name IN ('income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 'visualizations') THEN '✅ Missing API (exists in schema)'
    WHEN table_name IN ('gifts', 'events', 'progress_photos', 'secrets', 'freelance_projects', 'project_tasks', 'time_entries', 'project_documents') THEN '✅ Final API (exists in schema)'
    WHEN table_name IN ('memories', 'memory_images') THEN '✅ Memory API (exists in schema)'
    ELSE '⚠️ Unknown table'
  END as api_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    -- Core APIs
    'goals', 'tasks', 'habits', 'journal_entries', 'transactions',
    -- Health APIs  
    'sleep_records', 'exercise_records', 'nutrition_records',
    -- Lifestyle APIs
    'books', 'movies', 'memories', 'memory_images',
    -- Missing APIs we implemented
    'income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 
    'visualizations', 'gifts', 'events', 'progress_photos', 'secrets', 
    'freelance_projects', 'project_tasks', 'time_entries', 'project_documents'
  )
ORDER BY 
  CASE 
    WHEN table_name IN ('goals', 'tasks', 'habits', 'journal_entries', 'transactions') THEN 1
    WHEN table_name IN ('sleep_records', 'exercise_records', 'nutrition_records', 'books', 'movies') THEN 2
    WHEN table_name IN ('income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 'visualizations') THEN 3
    WHEN table_name IN ('gifts', 'events', 'progress_photos', 'secrets', 'freelance_projects', 'project_tasks', 'time_entries', 'project_documents') THEN 4
    WHEN table_name IN ('memories', 'memory_images') THEN 5
    ELSE 6
  END,
  table_name;

-- Check if user_id columns exist in all required tables
SELECT 
  table_name,
  column_name,
  data_type,
  '✅ user_id column exists' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'user_id'
  AND table_name IN (
    'goals', 'tasks', 'habits', 'journal_entries', 'transactions',
    'sleep_records', 'exercise_records', 'nutrition_records', 'books', 'movies',
    'income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 
    'visualizations', 'gifts', 'events', 'progress_photos', 'secrets', 
    'freelance_projects', 'project_tasks', 'time_entries', 'memories'
  )
ORDER BY table_name;

-- Check RLS status
SELECT 
  tablename, 
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled' 
    ELSE '❌ RLS Disabled' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'goals', 'tasks', 'habits', 'journal_entries', 'transactions',
    'sleep_records', 'exercise_records', 'nutrition_records', 'books', 'movies',
    'income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 
    'visualizations', 'gifts', 'events', 'progress_photos', 'secrets', 
    'freelance_projects', 'project_tasks', 'time_entries', 'project_documents', 'memories'
  )
ORDER BY tablename;

-- Summary
SELECT 
  'DIAGNOSIS COMPLETE' as status,
  'If you see all tables above, NO MIGRATION IS NEEDED!' as result,
  'Your schema already contains all required tables' as explanation,
  'The APIs should work with your existing database' as next_step;
