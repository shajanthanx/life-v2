-- Missing tables for the Life Manager Dashboard
-- Run this SQL in your Supabase SQL editor to add the missing tables

-- Income Sources table
CREATE TABLE IF NOT EXISTS income_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_id UUID REFERENCES income_sources(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bad Habits table
CREATE TABLE IF NOT EXISTS bad_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Visualizations table
CREATE TABLE IF NOT EXISTS visualizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Enable Row Level Security (RLS)
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Income Sources
CREATE POLICY "Users can view their own income sources" ON income_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own income sources" ON income_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income sources" ON income_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income sources" ON income_sources FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Income Records
CREATE POLICY "Users can view their own income records" ON income_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own income records" ON income_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income records" ON income_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income records" ON income_records FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Bad Habits
CREATE POLICY "Users can view their own bad habits" ON bad_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bad habits" ON bad_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bad habits" ON bad_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bad habits" ON bad_habits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Bad Habit Records
CREATE POLICY "Users can view their own bad habit records" ON bad_habit_records FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM bad_habits 
        WHERE bad_habits.id = bad_habit_records.habit_id 
        AND bad_habits.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their own bad habit records" ON bad_habit_records FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM bad_habits 
        WHERE bad_habits.id = bad_habit_records.habit_id 
        AND bad_habits.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update their own bad habit records" ON bad_habit_records FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM bad_habits 
        WHERE bad_habits.id = bad_habit_records.habit_id 
        AND bad_habits.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete their own bad habit records" ON bad_habit_records FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM bad_habits 
        WHERE bad_habits.id = bad_habit_records.habit_id 
        AND bad_habits.user_id = auth.uid()
    )
);

-- RLS Policies for Visualizations
CREATE POLICY "Users can view their own visualizations" ON visualizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own visualizations" ON visualizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visualizations" ON visualizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own visualizations" ON visualizations FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_sources_user_id ON income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_is_active ON income_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_income_records_user_id ON income_records(user_id);
CREATE INDEX IF NOT EXISTS idx_income_records_source_id ON income_records(source_id);
CREATE INDEX IF NOT EXISTS idx_income_records_date ON income_records(date);
CREATE INDEX IF NOT EXISTS idx_bad_habits_user_id ON bad_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_bad_habit_records_habit_id ON bad_habit_records(habit_id);
CREATE INDEX IF NOT EXISTS idx_bad_habit_records_date ON bad_habit_records(date);
CREATE INDEX IF NOT EXISTS idx_visualizations_user_id ON visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_category ON visualizations(category);
CREATE INDEX IF NOT EXISTS idx_visualizations_is_achieved ON visualizations(is_achieved);
