-- Final missing tables for complete Life Manager v2 implementation
-- Run this SQL in your Supabase SQL editor to create all remaining tables

-- =====================================================
-- 1. GIFTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Index for better query performance
CREATE INDEX IF NOT EXISTS gifts_user_id_idx ON gifts(user_id);
CREATE INDEX IF NOT EXISTS gifts_event_date_idx ON gifts(event_date);
CREATE INDEX IF NOT EXISTS gifts_status_idx ON gifts(status);

-- Enable RLS
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- RLS policies for gifts
CREATE POLICY "Users can view their own gifts" ON gifts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gifts" ON gifts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gifts" ON gifts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gifts" ON gifts
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Index for better query performance
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. PROGRESS PHOTOS TABLE  
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  muscle_mass DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS progress_photos_user_id_idx ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS progress_photos_date_idx ON progress_photos(date);

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for progress_photos
CREATE POLICY "Users can view their own progress photos" ON progress_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos" ON progress_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos" ON progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. SECRETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Index for better query performance
CREATE INDEX IF NOT EXISTS secrets_user_id_idx ON secrets(user_id);
CREATE INDEX IF NOT EXISTS secrets_type_idx ON secrets(type);
CREATE INDEX IF NOT EXISTS secrets_last_accessed_idx ON secrets(last_accessed);

-- Enable RLS
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- RLS policies for secrets
CREATE POLICY "Users can view their own secrets" ON secrets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own secrets" ON secrets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secrets" ON secrets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secrets" ON secrets
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. FREELANCE PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS freelance_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Index for better query performance
CREATE INDEX IF NOT EXISTS freelance_projects_user_id_idx ON freelance_projects(user_id);
CREATE INDEX IF NOT EXISTS freelance_projects_status_idx ON freelance_projects(status);
CREATE INDEX IF NOT EXISTS freelance_projects_deadline_idx ON freelance_projects(deadline);

-- Enable RLS
ALTER TABLE freelance_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for freelance_projects
CREATE POLICY "Users can view their own freelance projects" ON freelance_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own freelance projects" ON freelance_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own freelance projects" ON freelance_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own freelance projects" ON freelance_projects
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. PROJECT TASKS TABLE
-- =====================================================
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

-- Index for better query performance
CREATE INDEX IF NOT EXISTS project_tasks_project_id_idx ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS project_tasks_status_idx ON project_tasks(status);
CREATE INDEX IF NOT EXISTS project_tasks_priority_idx ON project_tasks(priority);

-- Enable RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_tasks (inherit from freelance_projects)
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

-- =====================================================
-- 7. TIME ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL NOT NULL CHECK (hours > 0),
  description TEXT,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS time_entries_project_id_idx ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS time_entries_date_idx ON time_entries(date);
CREATE INDEX IF NOT EXISTS time_entries_billable_idx ON time_entries(billable);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for time_entries
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 8. PROJECT DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS project_documents_project_id_idx ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS project_documents_type_idx ON project_documents(type);

-- Enable RLS
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_documents (inherit from freelance_projects)
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
-- FINAL VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created successfully
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'gifts', 'events', 'progress_photos', 'secrets', 
    'freelance_projects', 'project_tasks', 'time_entries', 'project_documents'
  )
ORDER BY table_name;

-- Verify RLS is enabled on all new tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'gifts', 'events', 'progress_photos', 'secrets', 
    'freelance_projects', 'project_tasks', 'time_entries', 'project_documents'
  )
ORDER BY tablename;
