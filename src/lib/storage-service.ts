import { supabase } from './supabase'
import { authService } from './auth'

export interface UploadResult {
  data: {
    url: string
    path: string
  } | null
  error: string | null
}

export async function uploadImage(file: File, bucket: string, folder?: string): Promise<UploadResult> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Create file path
    const filePath = folder 
      ? `${userId}/${folder}/${fileName}`
      : `${userId}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { data: null, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      data: {
        url: urlData.publicUrl,
        path: filePath
      },
      error: null
    }

  } catch (error) {
    return { data: null, error: 'Failed to upload image' }
  }
}

export async function deleteImage(bucket: string, path: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if the path belongs to the current user
    if (!path.startsWith(userId)) {
      return { success: false, error: 'Access denied' }
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete image' }
  }
}

export async function getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<{ url: string | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { url: null, error: 'Not authenticated' }
    }

    // Check if the path belongs to the current user
    if (!path.startsWith(userId)) {
      return { url: null, error: 'Access denied' }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return { url: null, error: error.message }
    }

    return { url: data.signedUrl, error: null }

  } catch (error) {
    return { url: null, error: 'Failed to generate signed URL' }
  }
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  JOURNAL_IMAGES: 'journal-images',
  EXERCISE_PHOTOS: 'exercise-photos',
  PROGRESS_PHOTOS: 'progress-photos',
  MEMORIES: 'memories',
  VISUALIZATIONS: 'visualizations',
  DOCUMENTS: 'documents'
} as const
