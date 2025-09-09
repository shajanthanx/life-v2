-- Life Management Dashboard - Supabase Database Schema
-- Run this in your Supabase SQL editor to create the complete database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productivity Module Tables
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('fitness', 'learning', 'career', 'personal', 'finance')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  value NUMERIC NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('work', 'health', 'errands', 'personal', 'finance')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT CHECK (recurring_pattern IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('health', 'productivity', 'mindfulness', 'fitness', 'learning')),
  target NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  value NUMERIC NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Health Module Tables
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sleep', 'exercise', 'nutrition', 'weight', 'mood', 'symptoms')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sleep_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  bedtime TIMESTAMP WITH TIME ZONE,
  wake_time TIMESTAMP WITH TIME ZONE,
  hours_slept NUMERIC,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('low', 'medium', 'high')),
  calories NUMERIC,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nutrition_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal TEXT NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance Module Tables
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT CHECK (recurring_pattern IN ('weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  allocated NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, month, year)
);

CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stocks', 'bonds', 'crypto', 'real_estate', 'other')),
  current_value NUMERIC NOT NULL,
  purchase_value NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lifestyle Module Tables
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('to_read', 'reading', 'completed')),
  current_page INTEGER,
  total_pages INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  started_at DATE,
  completed_at DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  director TEXT,
  year INTEGER,
  status TEXT NOT NULL CHECK (status IN ('to_watch', 'watching', 'completed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  watched_at DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bad_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  target_reduction NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bad_habit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES bad_habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  count NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Visualization and Memory Tables
CREATE TABLE visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('personal', 'career', 'health', 'finance', 'relationships')),
  target_date DATE,
  is_achieved BOOLEAN DEFAULT FALSE,
  progress NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  is_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE memory_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift and Event Planning Tables
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  occasion TEXT NOT NULL,
  gift_idea TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  purchase_date DATE,
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'purchased', 'given')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'holiday', 'celebration', 'other')),
  date DATE NOT NULL,
  budget NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  attendees TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Management Tables
CREATE TABLE income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('salary', 'freelance', 'investment', 'business', 'other')),
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'yearly', 'one-time')),
  next_pay_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE income_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES income_sources(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gratitude Table
CREATE TABLE gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  entries TEXT[] NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Secrets Management Table (with basic encryption - implement additional client-side encryption)
CREATE TABLE secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('password', 'credit_card', 'bank_account', 'identity', 'secure_note')),
  website TEXT,
  username TEXT,
  password TEXT NOT NULL, -- Should be encrypted before storing
  notes TEXT,
  custom_fields JSONB,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Freelancing Tables
CREATE TABLE freelance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  hourly_rate NUMERIC NOT NULL,
  estimated_hours NUMERIC NOT NULL,
  actual_hours NUMERIC DEFAULT 0,
  deadline DATE,
  budget NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hours NUMERIC NOT NULL,
  description TEXT NOT NULL,
  billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES freelance_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quick Notes Table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can access own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own milestones" ON milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid())
);

-- Tasks policies
CREATE POLICY "Users can access own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can access own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own habit records" ON habit_records FOR ALL USING (
  EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_records.habit_id AND habits.user_id = auth.uid())
);

-- Health policies
CREATE POLICY "Users can access own health metrics" ON health_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own sleep records" ON sleep_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own exercise records" ON exercise_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own nutrition records" ON nutrition_records FOR ALL USING (auth.uid() = user_id);

-- Finance policies
CREATE POLICY "Users can access own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own savings goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own investments" ON investments FOR ALL USING (auth.uid() = user_id);

-- Lifestyle policies
CREATE POLICY "Users can access own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own books" ON books FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own movies" ON movies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own bad habits" ON bad_habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own bad habit records" ON bad_habit_records FOR ALL USING (
  EXISTS (SELECT 1 FROM bad_habits WHERE bad_habits.id = bad_habit_records.habit_id AND bad_habits.user_id = auth.uid())
);

-- Memory and visualization policies
CREATE POLICY "Users can access own visualizations" ON visualizations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own memories" ON memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own memory images" ON memory_images FOR ALL USING (
  EXISTS (SELECT 1 FROM memories WHERE memories.id = memory_images.memory_id AND memories.user_id = auth.uid())
);
CREATE POLICY "Users can access own progress photos" ON progress_photos FOR ALL USING (auth.uid() = user_id);

-- Gift and event policies
CREATE POLICY "Users can access own gifts" ON gifts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own events" ON events FOR ALL USING (auth.uid() = user_id);

-- Income policies
CREATE POLICY "Users can access own income sources" ON income_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own income records" ON income_records FOR ALL USING (
  EXISTS (SELECT 1 FROM income_sources WHERE income_sources.id = income_records.source_id AND income_sources.user_id = auth.uid())
);

-- Gratitude policies
CREATE POLICY "Users can access own gratitude entries" ON gratitude_entries FOR ALL USING (auth.uid() = user_id);

-- Secrets policies (extra security)
CREATE POLICY "Users can access own secrets" ON secrets FOR ALL USING (auth.uid() = user_id);

-- Freelancing policies
CREATE POLICY "Users can access own freelance projects" ON freelance_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own project tasks" ON project_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_tasks.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can access own time entries" ON time_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = time_entries.project_id AND freelance_projects.user_id = auth.uid())
);
CREATE POLICY "Users can access own project documents" ON project_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM freelance_projects WHERE freelance_projects.id = project_documents.project_id AND freelance_projects.user_id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_records_habit_id_date ON habit_records(habit_id, date);
CREATE INDEX idx_sleep_records_user_id_date ON sleep_records(user_id, date);
CREATE INDEX idx_transactions_user_id_date ON transactions(user_id, date);
CREATE INDEX idx_journal_entries_user_id_date ON journal_entries(user_id, date);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket policies (Run these in the Storage section of Supabase dashboard)
-- 
-- CREATE STORAGE BUCKETS:
-- - avatars (public)
-- - journal-images (private)
-- - exercise-photos (private)
-- - progress-photos (private)
-- - memories (private)
-- - visualizations (private)
-- - documents (private)
--
-- STORAGE POLICIES:
-- 
-- For avatars bucket (public read):
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- For private buckets (apply to each: journal-images, exercise-photos, progress-photos, memories, visualizations, documents):
-- CREATE POLICY "Users can view own files" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can upload own files" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
