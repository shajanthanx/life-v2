/**
 * Image compression and optimization utilities for Supabase Storage
 */

import { uploadImage, STORAGE_BUCKETS } from './storage-service'

export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height
          height = maxWidth
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          reject(new Error('Failed to compress image'))
        }
      }, 'image/jpeg', quality)
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export async function uploadImageFile(file: File, bucket: string, folder?: string): Promise<{ url: string | null; path: string | null; error: string | null }> {
  try {
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, path: null, error: 'File too large. Please select an image under 5MB.' }
    }

    // Compress the image
    const compressedFile = await compressImage(file, 1200, 0.8)

    // Upload to Supabase Storage
    const result = await uploadImage(compressedFile, bucket, folder)

    if (result.error) {
      return { url: null, path: null, error: result.error }
    }

    return {
      url: result.data?.url || null,
      path: result.data?.path || null,
      error: null
    }

  } catch (error) {
    return { url: null, path: null, error: 'Failed to upload image' }
  }
}

export function handleImageUpload(
  e: React.ChangeEvent<HTMLInputElement>,
  bucket: string,
  onSuccess: (url: string) => void,
  onError: (error: string) => void,
  folder?: string
) {
  const file = e.target.files?.[0]
  if (!file) {
    onError('No file selected')
    return
  }

  uploadImageFile(file, bucket, folder)
    .then(result => {
      if (result.error) {
        onError(result.error)
      } else if (result.url) {
        onSuccess(result.url)
      } else {
        onError('Failed to upload image')
      }
    })
    .catch(() => onError('An unexpected error occurred'))
}

// Helper functions for specific image types
export async function uploadJournalImage(file: File): Promise<{ url: string | null; path: string | null; error: string | null }> {
  return uploadImageFile(file, STORAGE_BUCKETS.JOURNAL_IMAGES)
}

export async function uploadExercisePhoto(file: File): Promise<{ url: string | null; path: string | null; error: string | null }> {
  return uploadImageFile(file, STORAGE_BUCKETS.EXERCISE_PHOTOS)
}

export async function uploadProgressPhoto(file: File): Promise<{ url: string | null; path: string | null; error: string | null }> {
  return uploadImageFile(file, STORAGE_BUCKETS.PROGRESS_PHOTOS)
}

export async function uploadMemoryImage(file: File): Promise<{ url: string | null; path: string | null; error: string | null }> {
  return uploadImageFile(file, STORAGE_BUCKETS.MEMORIES)
}

export async function uploadVisualizationImage(file: File): Promise<{ url: string | null; path: string | null; error: string | null }> {
  return uploadImageFile(file, STORAGE_BUCKETS.VISUALIZATIONS)
}

export async function uploadAvatar(file: File): Promise<{ url: string | null; path: string | null; error: string | null }> {
  return uploadImageFile(file, STORAGE_BUCKETS.AVATARS)
}

// Handle multiple image uploads
export async function uploadMultipleImages(
  files: File[], 
  bucket: string, 
  folder?: string
): Promise<{ results: Array<{ url: string | null; error: string | null }>; errors: string[] }> {
  const results: Array<{ url: string | null; error: string | null }> = []
  const errors: string[] = []

  for (const file of files) {
    const result = await uploadImageFile(file, bucket, folder)
    results.push(result)
    
    if (result.error) {
      errors.push(result.error)
    }
  }

  return { results, errors }
}

// Convert base64 to File (for migrating existing data)
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
}