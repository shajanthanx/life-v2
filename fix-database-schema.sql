-- =============================================================================
-- DATABASE SCHEMA FIX SCRIPT
-- This script fixes missing columns and schema issues in your Supabase database
-- =============================================================================

-- 1. Fix time_entries table to include user_id column
DO $$
BEGIN
    -- Add user_id column to time_entries if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_entries' AND column_name = 'user_id'
    ) THEN
        -- Add the column first
        ALTER TABLE time_entries ADD COLUMN user_id UUID;
        
        -- Update existing records with user_id from related freelance_projects
        UPDATE time_entries SET user_id = (
            SELECT fp.user_id 
            FROM freelance_projects fp 
            WHERE fp.id = time_entries.project_id
        ) WHERE user_id IS NULL;
        
        -- Add the foreign key constraint and NOT NULL constraint
        ALTER TABLE time_entries 
            ADD CONSTRAINT time_entries_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
            
        ALTER TABLE time_entries ALTER COLUMN user_id SET NOT NULL;
        
        -- Add index for performance
        CREATE INDEX time_entries_user_id_idx ON time_entries(user_id);
        
        RAISE NOTICE 'Added user_id column to time_entries table';
    ELSE
        RAISE NOTICE 'user_id column already exists in time_entries table';
    END IF;
END $$;

-- 2. Fix RLS policies for time_entries
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;

-- Create proper RLS policies for time_entries
CREATE POLICY "Users can view their own time entries" ON time_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON time_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON time_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Ensure storage buckets exist for image uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('journal-images', 'journal-images', true),
    ('exercise-photos', 'exercise-photos', true),
    ('progress-photos', 'progress-photos', true),
    ('memories', 'memories', true),
    ('visualizations', 'visualizations', true),
    ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Ensure storage policies exist
DO $$
BEGIN
    -- Create storage policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Users can upload their own files'
    ) THEN
        CREATE POLICY "Users can upload their own files" ON storage.objects
            FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Users can view their own files'
    ) THEN
        CREATE POLICY "Users can view their own files" ON storage.objects
            FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Users can update their own files'
    ) THEN
        CREATE POLICY "Users can update their own files" ON storage.objects
            FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname = 'Users can delete their own files'
    ) THEN
        CREATE POLICY "Users can delete their own files" ON storage.objects
            FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- 5. Check and fix other critical tables
DO $$
BEGIN
    -- Check progress_photos has user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'progress_photos' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE progress_photos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to progress_photos table - YOU NEED TO UPDATE EXISTING RECORDS';
    END IF;
    
    -- Check memories has user_id  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'memories' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE memories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to memories table - YOU NEED TO UPDATE EXISTING RECORDS';
    END IF;
    
    -- Check visualizations has user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'visualizations' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE visualizations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to visualizations table - YOU NEED TO UPDATE EXISTING RECORDS';
    END IF;
END $$;

-- 6. Final message
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DATABASE SCHEMA FIX COMPLETE!';
    RAISE NOTICE 'If you see messages about adding user_id to other tables, you may need to';
    RAISE NOTICE 'manually update existing records with the correct user_id values.';
    RAISE NOTICE '=============================================================================';
END $$;
