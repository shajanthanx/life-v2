-- Supabase Storage Setup
-- Run these commands in your Supabase SQL Editor after creating the storage buckets

-- First, you need to create the buckets in the Supabase Dashboard:
-- Go to Storage > Buckets and create these buckets:
-- 1. avatars (public: true)
-- 2. journal-images (public: false)
-- 3. exercise-photos (public: false)
-- 4. progress-photos (public: false)
-- 5. memories (public: false)
-- 6. visualizations (public: false)
-- 7. documents (public: false)

-- After creating the buckets, run the following policies:

-- =============================================================================
-- AVATARS BUCKET POLICIES (Public bucket)
-- =============================================================================

-- Allow public read access to avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- JOURNAL IMAGES BUCKET POLICIES (Private bucket)
-- =============================================================================

-- Users can view their own journal images
CREATE POLICY "Users can view own journal images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'journal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own journal images
CREATE POLICY "Users can upload own journal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'journal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own journal images
CREATE POLICY "Users can update own journal images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'journal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own journal images
CREATE POLICY "Users can delete own journal images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'journal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- EXERCISE PHOTOS BUCKET POLICIES (Private bucket)
-- =============================================================================

-- Users can view their own exercise photos
CREATE POLICY "Users can view own exercise photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exercise-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own exercise photos
CREATE POLICY "Users can upload own exercise photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercise-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own exercise photos
CREATE POLICY "Users can update own exercise photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'exercise-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own exercise photos
CREATE POLICY "Users can delete own exercise photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exercise-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- PROGRESS PHOTOS BUCKET POLICIES (Private bucket)
-- =============================================================================

-- Users can view their own progress photos
CREATE POLICY "Users can view own progress photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own progress photos
CREATE POLICY "Users can upload own progress photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own progress photos
CREATE POLICY "Users can update own progress photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own progress photos
CREATE POLICY "Users can delete own progress photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- MEMORIES BUCKET POLICIES (Private bucket)
-- =============================================================================

-- Users can view their own memory images
CREATE POLICY "Users can view own memory images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'memories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own memory images
CREATE POLICY "Users can upload own memory images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'memories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own memory images
CREATE POLICY "Users can update own memory images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'memories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own memory images
CREATE POLICY "Users can delete own memory images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'memories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- VISUALIZATIONS BUCKET POLICIES (Private bucket)
-- =============================================================================

-- Users can view their own visualization images
CREATE POLICY "Users can view own visualization images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visualizations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own visualization images
CREATE POLICY "Users can upload own visualization images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'visualizations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own visualization images
CREATE POLICY "Users can update own visualization images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'visualizations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own visualization images
CREATE POLICY "Users can delete own visualization images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'visualizations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- DOCUMENTS BUCKET POLICIES (Private bucket)
-- =============================================================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- VERIFY STORAGE SETUP
-- =============================================================================

-- Query to verify all storage buckets exist
SELECT id, name, public, created_at 
FROM storage.buckets 
ORDER BY name;

-- Query to verify all storage policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
