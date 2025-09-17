-- =====================================================
-- COMPREHENSIVE DATABASE AUDIT QUERIES (FIXED VERSION)
-- Life Management Dashboard - Supabase Database Analysis
-- =====================================================

-- =====================================================
-- 1. DATABASE OVERVIEW & CONNECTION INFORMATION
-- =====================================================

-- Database name and version
SELECT 
    current_database() as database_name,
    version() as postgresql_version,
    current_user as current_user,
    session_user as session_user,
    inet_server_addr() as server_ip,
    inet_server_port() as server_port,
    current_setting('timezone') as timezone;

-- Active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    client_port,
    backend_start,
    state,
    query_start,
    state_change,
    wait_event_type,
    wait_event,
    query
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY query_start;

-- Database size and statistics
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    pg_size_pretty(pg_total_relation_size('pg_database')) as total_size,
    (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') as table_count,
    (SELECT count(*) FROM pg_views WHERE schemaname = 'public') as view_count,
    (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public') as index_count;

-- =====================================================
-- 2. SCHEMA STRUCTURE & TABLES INFORMATION
-- =====================================================

-- All tables with detailed information
SELECT 
    t.table_name,
    t.table_type,
    obj_description(c.oid) as table_comment,
    pg_size_pretty(pg_total_relation_size(c.oid)) as table_size,
    pg_size_pretty(pg_relation_size(c.oid)) as data_size,
    pg_size_pretty(pg_total_relation_size(c.oid) - pg_relation_size(c.oid)) as index_size,
    (SELECT count(*) FROM pg_stat_user_tables WHERE relname = t.table_name) as row_count_estimate
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
ORDER BY pg_total_relation_size(c.oid) DESC;

-- Table columns with detailed information
SELECT 
    t.table_name,
    c.column_name,
    c.ordinal_position,
    c.column_default,
    c.is_nullable,
    c.data_type,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.datetime_precision,
    c.udt_name,
    col_description(pgc.oid, c.ordinal_position) as column_comment
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN pg_class pgc ON pgc.relname = t.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- Foreign key relationships
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Primary keys
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Unique constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- 3. INDEXES INFORMATION
-- =====================================================

-- All indexes with detailed information
SELECT 
    pg_indexes.schemaname,
    pg_indexes.tablename,
    pg_indexes.indexname,
    pg_indexes.indexdef,
    pg_size_pretty(pg_relation_size(pg_stat_user_indexes.indexrelid)) as index_size,
    pg_stat_user_indexes.idx_scan as times_used,
    pg_stat_user_indexes.idx_tup_read as tuples_read,
    pg_stat_user_indexes.idx_tup_fetch as tuples_fetched
FROM pg_indexes
LEFT JOIN pg_stat_user_indexes ON pg_indexes.indexname = pg_stat_user_indexes.indexrelname
WHERE pg_indexes.schemaname = 'public'
ORDER BY pg_indexes.tablename, pg_indexes.indexname;

-- Index usage statistics
SELECT 
    pg_stat_user_indexes.schemaname,
    pg_stat_user_indexes.relname as tablename,
    pg_stat_user_indexes.indexrelname as indexname,
    pg_stat_user_indexes.idx_scan,
    pg_stat_user_indexes.idx_tup_read,
    pg_stat_user_indexes.idx_tup_fetch,
    pg_size_pretty(pg_relation_size(pg_stat_user_indexes.indexrelid)) as index_size,
    CASE 
        WHEN pg_stat_user_indexes.idx_scan = 0 THEN 'UNUSED'
        WHEN pg_stat_user_indexes.idx_scan < 100 THEN 'LOW_USAGE'
        WHEN pg_stat_user_indexes.idx_scan < 1000 THEN 'MEDIUM_USAGE'
        ELSE 'HIGH_USAGE'
    END as usage_level
FROM pg_stat_user_indexes
WHERE pg_stat_user_indexes.schemaname = 'public'
ORDER BY pg_stat_user_indexes.idx_scan DESC;

-- Missing indexes (tables without indexes)
SELECT 
    pg_stat_user_tables.schemaname,
    pg_stat_user_tables.relname as tablename,
    pg_size_pretty(pg_total_relation_size(pg_stat_user_tables.schemaname||'.'||pg_stat_user_tables.relname)) as table_size,
    pg_stat_user_tables.seq_scan,
    pg_stat_user_tables.seq_tup_read,
    CASE 
        WHEN pg_stat_user_tables.seq_scan > 0 THEN 'NEEDS_INDEX_REVIEW'
        ELSE 'OK'
    END as index_status
FROM pg_stat_user_tables
WHERE pg_stat_user_tables.schemaname = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE pg_indexes.tablename = pg_stat_user_tables.relname 
        AND pg_indexes.schemaname = 'public'
    )
ORDER BY pg_stat_user_tables.seq_scan DESC;

-- =====================================================
-- 4. FUNCTIONS & PROCEDURES
-- =====================================================

-- All functions and procedures
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    l.lanname as language,
    p.provolatile as volatility,
    p.proisstrict as is_strict,
    p.prosecdef as security_definer,
    obj_description(p.oid, 'pg_proc') as description,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname IN ('public', 'auth')
ORDER BY n.nspname, p.proname;

-- Function usage statistics (corrected columns)
SELECT 
    pg_stat_user_functions.schemaname,
    pg_stat_user_functions.funcname,
    pg_stat_user_functions.calls,
    pg_stat_user_functions.total_time,
    pg_stat_user_functions.self_time
FROM pg_stat_user_functions
WHERE pg_stat_user_functions.schemaname = 'public'
ORDER BY pg_stat_user_functions.calls DESC;

-- =====================================================
-- 5. TRIGGERS INFORMATION
-- =====================================================

-- All triggers
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_timing,
    t.action_orientation,
    t.action_statement,
    t.action_condition,
    pg_get_triggerdef(pg_trigger.oid) as trigger_definition
FROM information_schema.triggers t
LEFT JOIN pg_trigger ON pg_trigger.tgname = t.trigger_name
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

-- Trigger functions
SELECT 
    t.trigger_name,
    t.event_object_table,
    p.proname as trigger_function,
    pg_get_functiondef(p.oid) as function_definition
FROM information_schema.triggers t
JOIN pg_trigger pg_t ON pg_t.tgname = t.trigger_name
JOIN pg_proc p ON p.oid = pg_t.tgfoid
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- RLS status for all tables
SELECT 
    pg_tables.schemaname,
    pg_tables.tablename,
    pg_tables.rowsecurity as rls_enabled,
    pg_size_pretty(pg_total_relation_size(pg_tables.schemaname||'.'||pg_tables.tablename)) as table_size
FROM pg_tables
WHERE pg_tables.schemaname = 'public'
ORDER BY pg_tables.tablename;

-- All RLS policies
SELECT 
    pg_policies.schemaname,
    pg_policies.tablename,
    pg_policies.policyname,
    pg_policies.permissive,
    pg_policies.roles,
    pg_policies.cmd,
    pg_policies.qual,
    pg_policies.with_check
FROM pg_policies
WHERE pg_policies.schemaname = 'public'
ORDER BY pg_policies.tablename, pg_policies.policyname;

-- Policy usage statistics
SELECT 
    p.schemaname,
    p.tablename,
    p.policyname,
    s.n_tup_ins as inserts,
    s.n_tup_upd as updates,
    s.n_tup_del as deletes,
    s.n_live_tup as live_tuples,
    s.n_dead_tup as dead_tuples
FROM pg_policies p
LEFT JOIN pg_stat_user_tables s ON p.tablename = s.relname
WHERE p.schemaname = 'public'
ORDER BY p.tablename, p.policyname;

-- =====================================================
-- 7. SECURITY & PERMISSIONS
-- =====================================================

-- User roles and permissions
SELECT 
    r.rolname as role_name,
    r.rolsuper as is_superuser,
    r.rolinherit as can_inherit,
    r.rolcreaterole as can_create_roles,
    r.rolcreatedb as can_create_databases,
    r.rolcanlogin as can_login,
    r.rolreplication as can_replicate,
    r.rolconnlimit as connection_limit,
    r.rolvaliduntil as password_expires
FROM pg_roles r
WHERE r.rolname NOT LIKE 'pg_%'
ORDER BY r.rolname;

-- Table permissions
SELECT 
    t.table_name,
    p.grantee,
    p.privilege_type,
    p.is_grantable
FROM information_schema.table_privileges p
JOIN information_schema.tables t ON p.table_name = t.table_name
WHERE t.table_schema = 'public'
    AND p.grantor != p.grantee
ORDER BY t.table_name, p.grantee, p.privilege_type;

-- Column permissions
SELECT 
    t.table_name,
    c.column_name,
    p.grantee,
    p.privilege_type,
    p.is_grantable
FROM information_schema.column_privileges p
JOIN information_schema.tables t ON p.table_name = t.table_name
JOIN information_schema.columns c ON p.table_name = c.table_name AND p.column_name = c.column_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.column_name, p.grantee;

-- =====================================================
-- 8. STORAGE BUCKETS & POLICIES
-- =====================================================

-- Storage buckets information
SELECT 
    name as bucket_name,
    id as bucket_id,
    public as is_public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets
ORDER BY name;

-- Storage objects count per bucket
SELECT 
    bucket_id,
    count(*) as object_count,
    sum(metadata->>'size')::bigint as total_size_bytes,
    pg_size_pretty(sum(metadata->>'size')::bigint) as total_size_pretty,
    min(created_at) as oldest_object,
    max(created_at) as newest_object
FROM storage.objects
GROUP BY bucket_id
ORDER BY total_size_bytes DESC;

-- Storage policies
SELECT 
    pg_policies.schemaname,
    pg_policies.tablename,
    pg_policies.policyname,
    pg_policies.permissive,
    pg_policies.roles,
    pg_policies.cmd,
    pg_policies.qual,
    pg_policies.with_check
FROM pg_policies
WHERE pg_policies.schemaname = 'storage'
ORDER BY pg_policies.tablename, pg_policies.policyname;

-- Storage object details (sample)
SELECT 
    bucket_id,
    name,
    owner,
    metadata->>'size' as size_bytes,
    metadata->>'mimetype' as mime_type,
    created_at,
    updated_at
FROM storage.objects
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- 9. EXTENSIONS & PLUGINS
-- =====================================================

-- Installed extensions
SELECT 
    extname as extension_name,
    extversion as version,
    nspname as schema_name,
    extrelocatable as is_relocatable,
    extconfig as configuration,
    extcondition as conditions
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
ORDER BY extname;

-- Available extensions
SELECT 
    name,
    default_version,
    installed_version,
    comment
FROM pg_available_extensions
WHERE installed_version IS NOT NULL
ORDER BY name;

-- =====================================================
-- 10. PERFORMANCE & STATISTICS
-- =====================================================

-- Table statistics
SELECT 
    pg_stat_user_tables.schemaname,
    pg_stat_user_tables.relname as tablename,
    pg_stat_user_tables.n_tup_ins as total_inserts,
    pg_stat_user_tables.n_tup_upd as total_updates,
    pg_stat_user_tables.n_tup_del as total_deletes,
    pg_stat_user_tables.n_live_tup as live_tuples,
    pg_stat_user_tables.n_dead_tup as dead_tuples,
    pg_stat_user_tables.last_vacuum,
    pg_stat_user_tables.last_autovacuum,
    pg_stat_user_tables.last_analyze,
    pg_stat_user_tables.last_autoanalyze,
    pg_stat_user_tables.vacuum_count,
    pg_stat_user_tables.autovacuum_count,
    pg_stat_user_tables.analyze_count,
    pg_stat_user_tables.autoanalyze_count
FROM pg_stat_user_tables
WHERE pg_stat_user_tables.schemaname = 'public'
ORDER BY pg_stat_user_tables.n_live_tup DESC;

-- Index statistics
SELECT 
    pg_stat_user_indexes.schemaname,
    pg_stat_user_indexes.relname as tablename,
    pg_stat_user_indexes.indexrelname as indexname,
    pg_stat_user_indexes.idx_scan as times_used,
    pg_stat_user_indexes.idx_tup_read as tuples_read,
    pg_stat_user_indexes.idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(pg_stat_user_indexes.indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE pg_stat_user_indexes.schemaname = 'public'
ORDER BY pg_stat_user_indexes.idx_scan DESC;

-- Database activity
SELECT 
    datname as database_name,
    numbackends as active_connections,
    xact_commit as committed_transactions,
    xact_rollback as rolled_back_transactions,
    blks_read as blocks_read,
    blks_hit as blocks_hit,
    tup_returned as tuples_returned,
    tup_fetched as tuples_fetched,
    tup_inserted as tuples_inserted,
    tup_updated as tuples_updated,
    tup_deleted as tuples_deleted,
    conflicts,
    temp_files,
    temp_bytes,
    deadlocks,
    blk_read_time,
    blk_write_time
FROM pg_stat_database
WHERE datname = current_database();

-- =====================================================
-- 11. DATA INTEGRITY & CONSTRAINTS
-- =====================================================

-- Constraint violations check
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    contype as constraint_type,
    confrelid::regclass as referenced_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE contype IN ('f', 'p', 'u', 'c')
    AND conrelid IN (
        SELECT oid FROM pg_class 
        WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    )
ORDER BY conrelid::regclass, contype;

-- Orphaned records (potential FK violations)
-- This is a sample query - you may need to customize for your specific tables
SELECT 
    'goals' as table_name,
    count(*) as orphaned_records
FROM goals g
LEFT JOIN profiles p ON g.user_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'tasks' as table_name,
    count(*) as orphaned_records
FROM tasks t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'habits' as table_name,
    count(*) as orphaned_records
FROM habits h
LEFT JOIN profiles p ON h.user_id = p.id
WHERE p.id IS NULL;

-- =====================================================
-- 12. BACKUP & RECOVERY INFORMATION
-- =====================================================

-- WAL (Write-Ahead Log) information
SELECT 
    pg_current_wal_lsn() as current_wal_lsn,
    pg_walfile_name(pg_current_wal_lsn()) as current_wal_file,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) as total_wal_size;

-- Checkpoint information
SELECT 
    checkpoints_timed,
    checkpoints_req,
    checkpoint_write_time,
    checkpoint_sync_time,
    buffers_checkpoint,
    buffers_clean,
    maxwritten_clean,
    buffers_backend,
    buffers_backend_fsync,
    buffers_alloc
FROM pg_stat_bgwriter;

-- =====================================================
-- 13. CUSTOM QUERIES FOR YOUR SPECIFIC SCHEMA
-- =====================================================

-- User data summary
SELECT 
    'Total Users' as metric,
    count(*) as value
FROM profiles

UNION ALL

SELECT 
    'Active Goals' as metric,
    count(*) as value
FROM goals
WHERE is_completed = false

UNION ALL

SELECT 
    'Completed Goals' as metric,
    count(*) as value
FROM goals
WHERE is_completed = true

UNION ALL

SELECT 
    'Total Tasks' as metric,
    count(*) as value
FROM tasks

UNION ALL

SELECT 
    'Completed Tasks' as metric,
    count(*) as value
FROM tasks
WHERE is_completed = true

UNION ALL

SELECT 
    'Active Habits' as metric,
    count(*) as value
FROM habits
WHERE is_active = true

UNION ALL

SELECT 
    'Total Transactions' as metric,
    count(*) as value
FROM transactions

UNION ALL

SELECT 
    'Total Savings Goals' as metric,
    count(*) as value
FROM savings_goals;

-- Data distribution by user
SELECT 
    p.id,
    p.email,
    p.name,
    (SELECT count(*) FROM goals WHERE user_id = p.id) as goals_count,
    (SELECT count(*) FROM tasks WHERE user_id = p.id) as tasks_count,
    (SELECT count(*) FROM habits WHERE user_id = p.id) as habits_count,
    (SELECT count(*) FROM transactions WHERE user_id = p.id) as transactions_count,
    (SELECT count(*) FROM journal_entries WHERE user_id = p.id) as journal_entries_count,
    p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

-- Recent activity summary
SELECT 
    'Recent Goals Created' as activity_type,
    count(*) as count,
    max(created_at) as latest_activity
FROM goals
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'Recent Tasks Created' as activity_type,
    count(*) as count,
    max(created_at) as latest_activity
FROM tasks
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'Recent Transactions' as activity_type,
    count(*) as count,
    max(created_at) as latest_activity
FROM transactions
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'Recent Journal Entries' as activity_type,
    count(*) as count,
    max(created_at) as latest_activity
FROM journal_entries
WHERE created_at >= NOW() - INTERVAL '7 days';

-- =====================================================
-- END OF COMPREHENSIVE DATABASE AUDIT QUERIES
-- =====================================================


