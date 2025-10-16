-- =====================================================
-- Fitiva Supabase Storage Setup
-- =====================================================
-- This script sets up storage buckets and policies for
-- the content library file uploads (thumbnails & videos)
-- 
-- Run this in your Supabase SQL Editor after creating buckets
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Create thumbnails bucket for exercise thumbnail images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-thumbnails',
  'exercise-thumbnails', 
  false,  -- Private bucket, access controlled by RLS
  5242880,  -- 5MB limit for thumbnails
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create videos bucket for exercise demonstration videos  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-videos',
  'exercise-videos',
  false,  -- Private bucket, access controlled by RLS
  52428800,  -- 50MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
) ON CONFLICT (id) DO NOTHING;

-- Now set up the RLS policies:

-- =====================================================
-- 2. STORAGE POLICIES FOR EXERCISE THUMBNAILS
-- =====================================================

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Users can upload exercise thumbnails" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'exercise-thumbnails' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view thumbnails for exercises they can access
CREATE POLICY "Users can view exercise thumbnails" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'exercise-thumbnails' AND (
      -- Own thumbnails
      (storage.foldername(name))[1] = auth.uid()::text OR
      -- Thumbnails for global exercises
      EXISTS (
        SELECT 1 FROM content_library 
        WHERE thumbnail_url = storage.objects.name 
        AND is_global = true
      ) OR
      -- Thumbnails for org exercises (if WHITE_LABEL enabled)
      EXISTS (
        SELECT 1 FROM content_library cl
        JOIN user_organizations uo ON uo.org_id = cl.org_id
        WHERE cl.thumbnail_url = storage.objects.name 
        AND uo.user_id = auth.uid()
      )
    )
  );

-- Allow users to update their own thumbnails
CREATE POLICY "Users can update their exercise thumbnails" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'exercise-thumbnails' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own thumbnails
CREATE POLICY "Users can delete their exercise thumbnails" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'exercise-thumbnails' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 3. STORAGE POLICIES FOR EXERCISE VIDEOS
-- =====================================================

-- Allow authenticated users to upload videos
CREATE POLICY "Users can upload exercise videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'exercise-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view videos for exercises they can access
CREATE POLICY "Users can view exercise videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'exercise-videos' AND (
      -- Own videos
      (storage.foldername(name))[1] = auth.uid()::text OR
      -- Videos for global exercises
      EXISTS (
        SELECT 1 FROM content_library 
        WHERE video_url = storage.objects.name 
        AND is_global = true
      ) OR
      -- Videos for org exercises (if WHITE_LABEL enabled)
      EXISTS (
        SELECT 1 FROM content_library cl
        JOIN user_organizations uo ON uo.org_id = cl.org_id
        WHERE cl.video_url = storage.objects.name 
        AND uo.user_id = auth.uid()
      )
    )
  );

-- Allow users to update their own videos
CREATE POLICY "Users can update their exercise videos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'exercise-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their exercise videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'exercise-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 4. HELPER FUNCTIONS FOR FILE MANAGEMENT
-- =====================================================

-- Function to generate unique file names
CREATE OR REPLACE FUNCTION generate_file_name(
  file_extension TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT AS $$
BEGIN
  RETURN user_id::TEXT || '/' || gen_random_uuid()::TEXT || '.' || file_extension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public URL for uploaded files
CREATE OR REPLACE FUNCTION get_file_public_url(
  bucket_name TEXT,
  file_path TEXT
)
RETURNS TEXT AS $$
BEGIN
  -- This would be called from the application, not SQL
  -- Just documenting the pattern here
  RETURN 'https://your-project.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- Function to delete old file when updating exercise
CREATE OR REPLACE FUNCTION cleanup_old_exercise_files()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old thumbnail if changed
  IF OLD.thumbnail_url IS NOT NULL AND OLD.thumbnail_url != NEW.thumbnail_url THEN
    -- Note: In practice, you'd call storage API from application
    -- This is just for documentation
    -- DELETE FROM storage.objects WHERE name = OLD.thumbnail_url;
  END IF;
  
  -- Delete old video if changed
  IF OLD.video_url IS NOT NULL AND OLD.video_url != NEW.video_url THEN
    -- Note: In practice, you'd call storage API from application  
    -- DELETE FROM storage.objects WHERE name = OLD.video_url;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup files (commented out - handle in application instead)
-- CREATE TRIGGER cleanup_exercise_files_on_update
--   AFTER UPDATE ON content_library
--   FOR EACH ROW EXECUTE FUNCTION cleanup_old_exercise_files();

-- =====================================================
-- 5. FILE PATH STRUCTURE
-- =====================================================
-- 
-- Recommended file organization:
-- 
-- exercise-thumbnails/
--   ├── {user_id}/
--   │   ├── {uuid}.jpg
--   │   ├── {uuid}.png
--   │   └── {uuid}.webp
-- 
-- exercise-videos/
--   ├── {user_id}/
--   │   ├── {uuid}.mp4
--   │   ├── {uuid}.webm
--   │   └── {uuid}.mov
--
-- =====================================================
-- STORAGE BUCKET CONFIGURATION
-- =====================================================
--
-- In Supabase Dashboard > Storage:
--
-- exercise-thumbnails bucket:
-- - Public: false (controlled by RLS)
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- exercise-videos bucket: 
-- - Public: false (controlled by RLS)
-- - File size limit: 50MB (adjust as needed)
-- - Allowed MIME types: video/mp4, video/webm, video/quicktime
--
-- =====================================================