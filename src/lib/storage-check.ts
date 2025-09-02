import { supabase } from './supabase'
import { STORAGE_BUCKETS } from './storage-service'

export interface StorageCheckResult {
  bucketsExist: boolean
  missingBuckets: string[]
  storageAccessible: boolean
  error?: string
}

/**
 * Check if all required storage buckets exist and are accessible
 */
export async function checkStorageSetup(): Promise<StorageCheckResult> {
  try {
    // Get list of existing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      return {
        bucketsExist: false,
        missingBuckets: [],
        storageAccessible: false,
        error: error.message
      }
    }

    // Check which required buckets are missing
    const existingBucketIds = buckets.map(bucket => bucket.id)
    const requiredBuckets = Object.values(STORAGE_BUCKETS)
    const missingBuckets = requiredBuckets.filter(bucket => !existingBucketIds.includes(bucket))

    const bucketsExist = missingBuckets.length === 0

    return {
      bucketsExist,
      missingBuckets,
      storageAccessible: true,
      error: undefined
    }

  } catch (error) {
    return {
      bucketsExist: false,
      missingBuckets: [],
      storageAccessible: false,
      error: error instanceof Error ? error.message : 'Unknown storage error'
    }
  }
}

/**
 * Test storage upload functionality
 */
export async function testStorageUpload(): Promise<{ success: boolean; error?: string }> {
  try {
    // Create a small test file
    const testContent = 'Storage test file'
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
    
    // Try to upload to documents bucket
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload('test/storage-test.txt', testFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // Clean up test file
    await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .remove(['test/storage-test.txt'])

    return { success: true }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown upload error' 
    }
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number
  bucketStats: Array<{ bucket: string; fileCount: number; error?: string }>
}> {
  const bucketStats: Array<{ bucket: string; fileCount: number; error?: string }> = []
  let totalFiles = 0

  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    try {
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        bucketStats.push({ bucket, fileCount: 0, error: error.message })
      } else {
        const fileCount = files?.length || 0
        bucketStats.push({ bucket, fileCount })
        totalFiles += fileCount
      }
    } catch (error) {
      bucketStats.push({ 
        bucket, 
        fileCount: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  return { totalFiles, bucketStats }
}

/**
 * Comprehensive storage health check
 */
export async function performStorageHealthCheck(): Promise<{
  healthy: boolean
  checks: {
    bucketsExist: boolean
    uploadWorks: boolean
    storageAccessible: boolean
  }
  details: {
    storageCheck: StorageCheckResult
    uploadTest: { success: boolean; error?: string }
    stats: { totalFiles: number; bucketStats: Array<{ bucket: string; fileCount: number; error?: string }> }
  }
  errors: string[]
}> {
  const errors: string[] = []

  // Check if buckets exist
  const storageCheck = await checkStorageSetup()
  if (!storageCheck.bucketsExist) {
    errors.push(`Missing storage buckets: ${storageCheck.missingBuckets.join(', ')}`)
  }
  if (storageCheck.error) {
    errors.push(`Storage access error: ${storageCheck.error}`)
  }

  // Test upload functionality
  const uploadTest = await testStorageUpload()
  if (!uploadTest.success && uploadTest.error) {
    errors.push(`Upload test failed: ${uploadTest.error}`)
  }

  // Get storage statistics
  const stats = await getStorageStats()

  const healthy = storageCheck.bucketsExist && 
                  storageCheck.storageAccessible && 
                  uploadTest.success

  return {
    healthy,
    checks: {
      bucketsExist: storageCheck.bucketsExist,
      uploadWorks: uploadTest.success,
      storageAccessible: storageCheck.storageAccessible
    },
    details: {
      storageCheck,
      uploadTest,
      stats
    },
    errors
  }
}
