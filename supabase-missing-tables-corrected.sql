-- CORRECTED Missing Tables Migration for Life Manager v2
-- This script only creates tables that don't exist yet and uses correct foreign key references
-- Run this SQL in your Supabase SQL editor

-- Note: Your existing schema uses profiles(id) as the user reference, not auth.users(id)
-- This migration respects that convention

DO $$
BEGIN
    RAISE NOTICE 'Starting corrected Life Manager v2 missing tables migration...';
    RAISE NOTICE 'Using profiles(id) as user reference to match existing schema...';
END $$;

-- =====================================================
-- INCOME MANAGEMENT TABLES
-- =====================================================

-- Income Sources table
CREATE TABLE IF NOT EXISTS income_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('salary', 'freelance', 'investment', 'business', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'yearly', 'one-time')),
    next_pay_date DATE,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Income Records table
CREATE TABLE IF NOT EXISTS income_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    source_id UUID REFERENCES income_sources(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- BAD HABITS TRACKING TABLES
-- =====================================================

-- Bad Habits table
CREATE TABLE IF NOT EXISTS bad_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    target_reduction INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bad Habit Records table
CREATE TABLE IF NOT EXISTS bad_habit_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_id UUID REFERENCES bad_habits(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(habit_id, date)
);

-- =====================================================
-- VISUALIZATION BOARD TABLE
-- =====================================================

-- Visualizations table
CREATE TABLE IF NOT EXISTS visualizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('personal', 'career', 'health', 'finance', 'relationships')),
    target_date DATE,
    is_achieved BOOLEAN DEFAULT false,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- GIFT & EVENT PLANNING TABLES
-- =====================================================

-- Gifts table
CREATE TABLE IF NOT EXISTS gifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    occasion TEXT NOT NULL,
    gift_idea TEXT NOT NULL,
    budget DECIMAL,
    spent DECIMAL,
    purchase_date TIMESTAMPTZ,
    event_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'purchased', 'given')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'meeting', 'party', 'vacation', 'work', 'personal', 'other')),
    date TIMESTAMPTZ NOT NULL,
    budget DECIMAL,
    spent DECIMAL DEFAULT 0,
    attendees TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HEALTH & FITNESS TABLES
-- =====================================================

-- Progress Photos table
CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    date DATE NOT NULL,
    weight DECIMAL,
    body_fat_percentage DECIMAL,
    muscle_mass DECIMAL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECURITY & SECRETS TABLES
-- =====================================================

-- Secrets table
CREATE TABLE IF NOT EXISTS secrets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'login' CHECK (type IN ('login', 'credit_card', 'secure_note', 'identity', 'document', 'other')),
    website TEXT,
    username TEXT,
    password TEXT NOT NULL, -- Encrypted in the application layer
    notes TEXT,
    custom_fields JSONB,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FREELANCING & PROJECT MANAGEMENT TABLES
-- =====================================================

-- Freelance Projects table
CREATE TABLE IF NOT EXISTS freelance_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    client TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    hourly_rate DECIMAL NOT NULL,
    estimated_hours INTEGER NOT NULL,
    actual_hours INTEGER DEFAULT 0,
    deadline TIMESTAMPTZ,
    budget DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL NOT NULL CHECK (hours > 0),
    description TEXT,
    billable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Documents table
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Income Sources Policies
DROP POLICY IF EXISTS "Users can view their own income sources" ON income_sources;
DROP POLICY IF EXISTS "Users can insert their own income sources" ON income_sources;
DROP POLICY IF EXISTS "Users can update their own income sources" ON income_sources;
DROP POLICY IF EXISTS "Users can delete their own income sources" ON income_sources;

CREATE POLICY "Users can view their own income sources" ON income_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own income sources" ON income_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income sources" ON income_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income sources" ON income_sources FOR DELETE USING (auth.uid() = user_id);

-- Income Records Policies
DROP POLICY IF EXISTS "Users can view their own income records" ON income_records;
DROP POLICY IF EXISTS "Users can insert their own income records" ON income_records;
DROP POLICY IF EXISTS "Users can update their own income records" ON income_records;
DROP POLICY IF EXISTS "Users can delete their own income records" ON income_records;

CREATE POLICY "Users can view their own income records" ON income_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own income records" ON income_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income records" ON income_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income records" ON income_records FOR DELETE USING (auth.uid() = user_id);

-- Bad Habits Policies
DROP POLICY IF EXISTS "Users can view their own bad habits" ON bad_habits;
DROP POLICY IF EXISTS "Users can insert their own bad habits" ON bad_habits;
DROP POLICY IF EXISTS "Users can update their own bad habits" ON bad_habits;
DROP POLICY IF EXISTS "Users can delete their own bad habits" ON bad_habits;

CREATE POLICY "Users can view their own bad habits" ON bad_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bad habits" ON bad_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bad habits" ON bad_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bad habits" ON bad_habits FOR DELETE USING (auth.uid() = user_id);

-- Bad Habit Records Policies
DROP POLICY IF EXISTS "Users can view their own bad habit records" ON bad_habit_records;
DROP POLICY IF EXISTS "Users can insert their own bad habit records" ON bad_habit_records;
DROP POLICY IF EXISTS "Users can update their own bad habit records" ON bad_habit_records;
DROP POLICY IF EXISTS "Users can delete their own bad habit records" ON bad_habit_records;

CREATE POLICY "Users can view their own bad habit records" ON bad_habit_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM bad_habits WHERE bad_habits.id = bad_habit_records.habit_id AND bad_habits.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own bad habit records" ON bad_habit_records FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bad_habits WHERE bad_habits.id = bad_habit_records.habit_id AND bad_habits.user_id = auth.uid())
);
CREATE POLICY "Users can update their own bad habit records" ON bad_habit_records FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bad_habits WHERE bad_habits.id = bad_habit_records.habit_id AND bad_habits.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own bad habit records" ON bad_habit_records FOR DELETE USING (
    EXISTS (SELECT 1 FROM bad_habits WHERE bad_habits.id = bad_habit_records.habit_id AND bad_habits.user_id = auth.uid())
);

-- Visualizations Policies
DROP POLICY IF EXISTS "Users can view their own visualizations" ON visualizations;
DROP POLICY IF EXISTS "Users can insert their own visualizations" ON visualizations;
DROP POLICY IF EXISTS "Users can update their own visualizations" ON visualizations;
DROP POLICY IF EXISTS "Users can delete their own visualizations" ON visualizations;

CREATE POLICY "Users can view their own visualizations" ON visualizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own visualizations" ON visualizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visualizations" ON visualizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own visualizations" ON visualizations FOR DELETE USING (auth.uid() = user_id);

-- Gifts Policies
DROP POLICY IF EXISTS "Users can view their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can insert their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can update their own gifts" ON gifts;
DROP POLICY IF EXISTS "Users can delete their own gifts" ON gifts;

CREATE POLICY "Users can view their own gifts" ON gifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own gifts" ON gifts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own gifts" ON gifts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own gifts" ON gifts FOR DELETE USING (auth.uid() = user_id);

-- Events Policies
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- Progress Photos Policies
DROP POLICY IF EXISTS "Users can view their own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can insert their own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can update their own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can delete their own progress photos" ON progress_photos;

CREATE POLICY "Users can view their own progress photos" ON progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress photos" ON progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress photos" ON progress_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress photos" ON progress_photos FOR DELETE USING (auth.uid() = user_id);

-- Secrets Policies
DROP POLICY IF EXISTS "Users can view their own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can insert their own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can update their own secrets" ON secrets;
DROP POLICY IF EXISTS "Users can delete their own secrets" ON secrets;

CREATE POLICY "Users can view their own secrets" ON secrets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own secrets" ON secrets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own secrets" ON secrets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own secrets" ON secrets FOR DELETE USING (auth.uid() = user_id);

-- Freelance Projects Policies
DROP POLICY IF EXISTS "Users can view their own freelance projects" ON freelance_projects;
DROP POLICY IF EXISTS "Users can insert their own freelance projects" ON freelance_projects;
DROP POLICY IF EXISTS "Users can update their own freelance projects" ON freelance_projects;
DROP POLICY IF EXISTS "Users can delete their own freelance projects" ON freelance_projects;

CREATE POLICY "Users can view their own freelance projects" ON freelance_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own freelance projects" ON freelance_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own freelance projects" ON freelance_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own freelance projects" ON freelance_projects FOR DELETE USING (auth.uid() = user_id);

-- Project Tasks Policies
DROP POLICY IF EXISTS "Users can view project tasks for their projects" ON project_tasks;
DROP POLICY IF EXISTS "Users can insert project tasks for their projects" ON project_tasks;
DROP POLICY IF EXISTS "Users can update project tasks for their projects" ON project_tasks;
DROP POLICY IF EXISTS "Users can delete project tasks for their projects" ON project_tasks;

CREATE POLICY "Users can view project tasks for their projects" ON project_tasks FOR SELECT USING (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_tasks.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can insert project tasks for their projects" ON project_tasks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_tasks.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can update project tasks for their projects" ON project_tasks FOR UPDATE USING (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_tasks.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete project tasks for their projects" ON project_tasks FOR DELETE USING (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_tasks.project_id AND freelance_projects.user_id = auth.uid())
);

-- Time Entries Policies
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;

CREATE POLICY "Users can view their own time entries" ON time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own time entries" ON time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own time entries" ON time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own time entries" ON time_entries FOR DELETE USING (auth.uid() = user_id);

-- Project Documents Policies
DROP POLICY IF EXISTS "Users can view documents for their projects" ON project_documents;
DROP POLICY IF EXISTS "Users can insert documents for their projects" ON project_documents;
DROP POLICY IF EXISTS "Users can update documents for their projects" ON project_documents;
DROP POLICY IF EXISTS "Users can delete documents for their projects" ON project_documents;

CREATE POLICY "Users can view documents for their projects" ON project_documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_documents.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can insert documents for their projects" ON project_documents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_documents.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can update documents for their projects" ON project_documents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_documents.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete documents for their projects" ON project_documents FOR DELETE USING (
    EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_documents.project_id AND freelance_projects.user_id = auth.uid())
);

-- =====================================================
-- CREATE PERFORMANCE INDEXES
-- =====================================================

-- Income Sources indexes
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_is_active ON income_sources(is_active);

-- Income Records indexes
CREATE INDEX IF NOT EXISTS idx_income_records_user_id ON income_records(user_id);
CREATE INDEX IF NOT EXISTS idx_income_records_source_id ON income_records(source_id);
CREATE INDEX IF NOT EXISTS idx_income_records_date ON income_records(date);

-- Bad Habits indexes
CREATE INDEX IF NOT EXISTS idx_bad_habits_user_id ON bad_habits(user_id);

-- Bad Habit Records indexes
CREATE INDEX IF NOT EXISTS idx_bad_habit_records_habit_id ON bad_habit_records(habit_id);
CREATE INDEX IF NOT EXISTS idx_bad_habit_records_date ON bad_habit_records(date);

-- Visualizations indexes
CREATE INDEX IF NOT EXISTS idx_visualizations_user_id ON visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_category ON visualizations(category);
CREATE INDEX IF NOT EXISTS idx_visualizations_is_achieved ON visualizations(is_achieved);

-- Gifts indexes
CREATE INDEX IF NOT EXISTS gifts_user_id_idx ON gifts(user_id);
CREATE INDEX IF NOT EXISTS gifts_event_date_idx ON gifts(event_date);
CREATE INDEX IF NOT EXISTS gifts_status_idx ON gifts(status);

-- Events indexes
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);

-- Progress Photos indexes
CREATE INDEX IF NOT EXISTS progress_photos_user_id_idx ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS progress_photos_date_idx ON progress_photos(date);

-- Secrets indexes
CREATE INDEX IF NOT EXISTS secrets_user_id_idx ON secrets(user_id);
CREATE INDEX IF NOT EXISTS secrets_type_idx ON secrets(type);
CREATE INDEX IF NOT EXISTS secrets_last_accessed_idx ON secrets(last_accessed);

-- Freelance Projects indexes
CREATE INDEX IF NOT EXISTS freelance_projects_user_id_idx ON freelance_projects(user_id);
CREATE INDEX IF NOT EXISTS freelance_projects_status_idx ON freelance_projects(status);
CREATE INDEX IF NOT EXISTS freelance_projects_deadline_idx ON freelance_projects(deadline);

-- Project Tasks indexes
CREATE INDEX IF NOT EXISTS project_tasks_project_id_idx ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS project_tasks_status_idx ON project_tasks(status);
CREATE INDEX IF NOT EXISTS project_tasks_priority_idx ON project_tasks(priority);

-- Time Entries indexes
CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS time_entries_project_id_idx ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS time_entries_date_idx ON time_entries(date);
CREATE INDEX IF NOT EXISTS time_entries_billable_idx ON time_entries(billable);

-- Project Documents indexes
CREATE INDEX IF NOT EXISTS project_documents_project_id_idx ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS project_documents_type_idx ON project_documents(type);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all new tables exist
SELECT 
    table_name,
    'Table created successfully' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 
        'visualizations', 'gifts', 'events', 'progress_photos', 'secrets', 
        'freelance_projects', 'project_tasks', 'time_entries', 'project_documents'
    )
ORDER BY table_name;

-- Verify RLS is enabled
SELECT 
    tablename, 
    CASE WHEN rowsecurity THEN 'RLS Enabled ✓' ELSE 'RLS Not Enabled ✗' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 
        'visualizations', 'gifts', 'events', 'progress_photos', 'secrets', 
        'freelance_projects', 'project_tasks', 'time_entries', 'project_documents'
    )
ORDER BY tablename;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ CORRECTED Life Manager v2 Migration SUCCESSFUL!';
    RAISE NOTICE '🎉 All missing tables created with proper foreign key references!';
    RAISE NOTICE '🔒 All RLS policies applied successfully!';
    RAISE NOTICE '⚡ All performance indexes created!';
    RAISE NOTICE '🚀 Your Life Manager Dashboard is now ready!';
END $$;
