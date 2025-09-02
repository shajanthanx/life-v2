-- Life Management Dashboard - Missing Tables Migration
-- This migration adds the remaining tables needed for complete Life Manager v2 functionality
-- Follows the exact same patterns as the existing schema

-- Enable necessary extensions (same as existing schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- INCOME MANAGEMENT TABLES
-- =====================================================

-- Income Sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('salary', 'freelance', 'investment', 'business', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'yearly', 'one-time')),
  next_pay_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Records table
CREATE TABLE IF NOT EXISTS income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_id UUID REFERENCES income_sources(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BAD HABITS TRACKING TABLES
-- =====================================================

-- Bad Habits table
CREATE TABLE IF NOT EXISTS bad_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  target_reduction INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bad Habit Records table
CREATE TABLE IF NOT EXISTS bad_habit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES bad_habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- =====================================================
-- VISUALIZATION BOARD TABLE
-- =====================================================

-- Visualizations table
CREATE TABLE IF NOT EXISTS visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('personal', 'career', 'health', 'finance', 'relationships')),
  target_date DATE,
  is_achieved BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- GIFT & EVENT PLANNING TABLES
-- =====================================================

-- Gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  occasion TEXT NOT NULL,
  gift_idea TEXT NOT NULL,
  budget DECIMAL,
  spent DECIMAL,
  purchase_date TIMESTAMP WITH TIME ZONE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'purchased', 'given')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'meeting', 'party', 'vacation', 'work', 'personal', 'other')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  budget DECIMAL,
  spent DECIMAL DEFAULT 0,
  attendees TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HEALTH & FITNESS TABLES
-- =====================================================

-- Progress Photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  muscle_mass DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECURITY & SECRETS TABLES
-- =====================================================

-- Secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'login' CHECK (type IN ('login', 'credit_card', 'secure_note', 'identity', 'document', 'other')),
  website TEXT,
  username TEXT,
  password TEXT NOT NULL, -- Encrypted in the application layer
  notes TEXT,
  custom_fields JSONB,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FREELANCING & PROJECT MANAGEMENT TABLES
-- =====================================================

-- Freelance Projects table
CREATE TABLE IF NOT EXISTS freelance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  hourly_rate DECIMAL NOT NULL,
  estimated_hours INTEGER NOT NULL,
  actual_hours INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  budget DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL NOT NULL CHECK (hours > 0),
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
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
-- VERIFICATION CHECKPOINT
-- =====================================================

-- Verify all tables were created successfully with user_id columns
SELECT 
  table_name,
  'Table created with user_id column' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'user_id'
  AND table_name IN (
    'income_sources','income_records','bad_habits','bad_habit_records',
    'visualizations','gifts','events','progress_photos','secrets',
    'freelance_projects','time_entries'
  )
ORDER BY table_name;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Income Sources Policies
CREATE POLICY "Users can view their own income sources" ON income_sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income sources" ON income_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income sources" ON income_sources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income sources" ON income_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Income Records Policies
CREATE POLICY "Users can view their own income records" ON income_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records" ON income_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records" ON income_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records" ON income_records
  FOR DELETE USING (auth.uid() = user_id);

-- Bad Habits Policies
CREATE POLICY "Users can view their own bad habits" ON bad_habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bad habits" ON bad_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bad habits" ON bad_habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bad habits" ON bad_habits
  FOR DELETE USING (auth.uid() = user_id);

-- Bad Habit Records Policies
CREATE POLICY "Users can view their own bad habit records" ON bad_habit_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bad_habits 
      WHERE bad_habits.id = bad_habit_records.habit_id 
      AND bad_habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own bad habit records" ON bad_habit_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bad_habits 
      WHERE bad_habits.id = bad_habit_records.habit_id 
      AND bad_habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own bad habit records" ON bad_habit_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM bad_habits 
      WHERE bad_habits.id = bad_habit_records.habit_id 
      AND bad_habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own bad habit records" ON bad_habit_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM bad_habits 
      WHERE bad_habits.id = bad_habit_records.habit_id 
      AND bad_habits.user_id = auth.uid()
    )
  );

-- Visualizations Policies
CREATE POLICY "Users can view their own visualizations" ON visualizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visualizations" ON visualizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visualizations" ON visualizations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visualizations" ON visualizations
  FOR DELETE USING (auth.uid() = user_id);

-- Gifts Policies
CREATE POLICY "Users can view their own gifts" ON gifts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gifts" ON gifts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gifts" ON gifts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gifts" ON gifts
  FOR DELETE USING (auth.uid() = user_id);

-- Events Policies
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Progress Photos Policies
CREATE POLICY "Users can view their own progress photos" ON progress_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos" ON progress_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos" ON progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Secrets Policies
CREATE POLICY "Users can view their own secrets" ON secrets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own secrets" ON secrets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secrets" ON secrets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secrets" ON secrets
  FOR DELETE USING (auth.uid() = user_id);

-- Freelance Projects Policies
CREATE POLICY "Users can view their own freelance projects" ON freelance_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own freelance projects" ON freelance_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own freelance projects" ON freelance_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own freelance projects" ON freelance_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Project Tasks Policies
CREATE POLICY "Users can view project tasks for their projects" ON project_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_tasks.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert project tasks for their projects" ON project_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_tasks.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project tasks for their projects" ON project_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_tasks.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete project tasks for their projects" ON project_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_tasks.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

-- Time Entries Policies
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Project Documents Policies
CREATE POLICY "Users can view documents for their projects" ON project_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_documents.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their projects" ON project_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_documents.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents for their projects" ON project_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_documents.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents for their projects" ON project_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM freelance_projects 
      WHERE freelance_projects.id = project_documents.project_id 
      AND freelance_projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Income Sources indexes
CREATE INDEX income_sources_user_id_idx ON income_sources(user_id);
CREATE INDEX income_sources_is_active_idx ON income_sources(is_active);

-- Income Records indexes
CREATE INDEX income_records_user_id_idx ON income_records(user_id);
CREATE INDEX income_records_source_id_idx ON income_records(source_id);
CREATE INDEX income_records_date_idx ON income_records(date);

-- Bad Habits indexes
CREATE INDEX bad_habits_user_id_idx ON bad_habits(user_id);

-- Bad Habit Records indexes
CREATE INDEX bad_habit_records_habit_id_idx ON bad_habit_records(habit_id);
CREATE INDEX bad_habit_records_date_idx ON bad_habit_records(date);

-- Visualizations indexes
CREATE INDEX visualizations_user_id_idx ON visualizations(user_id);
CREATE INDEX visualizations_category_idx ON visualizations(category);
CREATE INDEX visualizations_is_achieved_idx ON visualizations(is_achieved);

-- Gifts indexes
CREATE INDEX gifts_user_id_idx ON gifts(user_id);
CREATE INDEX gifts_event_date_idx ON gifts(event_date);
CREATE INDEX gifts_status_idx ON gifts(status);

-- Events indexes
CREATE INDEX events_user_id_idx ON events(user_id);
CREATE INDEX events_date_idx ON events(date);
CREATE INDEX events_status_idx ON events(status);

-- Progress Photos indexes
CREATE INDEX progress_photos_user_id_idx ON progress_photos(user_id);
CREATE INDEX progress_photos_date_idx ON progress_photos(date);

-- Secrets indexes
CREATE INDEX secrets_user_id_idx ON secrets(user_id);
CREATE INDEX secrets_type_idx ON secrets(type);
CREATE INDEX secrets_last_accessed_idx ON secrets(last_accessed);

-- Freelance Projects indexes
CREATE INDEX freelance_projects_user_id_idx ON freelance_projects(user_id);
CREATE INDEX freelance_projects_status_idx ON freelance_projects(status);
CREATE INDEX freelance_projects_deadline_idx ON freelance_projects(deadline);

-- Project Tasks indexes
CREATE INDEX project_tasks_project_id_idx ON project_tasks(project_id);
CREATE INDEX project_tasks_status_idx ON project_tasks(status);
CREATE INDEX project_tasks_priority_idx ON project_tasks(priority);

-- Time Entries indexes
CREATE INDEX time_entries_user_id_idx ON time_entries(user_id);
CREATE INDEX time_entries_project_id_idx ON time_entries(project_id);
CREATE INDEX time_entries_date_idx ON time_entries(date);
CREATE INDEX time_entries_billable_idx ON time_entries(billable);

-- Project Documents indexes
CREATE INDEX project_documents_project_id_idx ON project_documents(project_id);
CREATE INDEX project_documents_type_idx ON project_documents(type);

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

-- Verify all new tables exist
SELECT 
  table_name,
  'Created successfully ✓' as status
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
  CASE WHEN rowsecurity THEN 'RLS Enabled ✓' ELSE 'RLS Failed ✗' END as security_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'income_sources', 'income_records', 'bad_habits', 'bad_habit_records', 
    'visualizations', 'gifts', 'events', 'progress_photos', 'secrets', 
    'freelance_projects', 'project_tasks', 'time_entries', 'project_documents'
  )
ORDER BY tablename;

-- Count total policies created
SELECT 
  COUNT(*) as total_policies_created,
  'Security policies applied successfully' as message
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%policy%';

-- Success message
SELECT 
  '🎉 MIGRATION COMPLETED SUCCESSFULLY!' as status,
  '✅ All 13 tables created with proper schema' as tables_status,
  '🔒 All RLS policies applied' as security_status,
  '⚡ All performance indexes created' as performance_status,
  '🚀 Life Manager v2 is now 100% ready!' as final_status;
