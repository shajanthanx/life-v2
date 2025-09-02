#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * 
 * This script creates all necessary storage buckets for the Life Management Dashboard.
 * Run this after setting up your Supabase project and before running the storage policies SQL.
 * 
 * Prerequisites:
 * 1. Install dependencies: npm install @supabase/supabase-js
 * 2. Set environment variables in .env.local
 * 3. Make sure you have service role key permissions
 * 
 * Usage:
 * node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const buckets = [
  {
    id: 'avatars',
    name: 'avatars',
    public: true,
    description: 'User profile avatars'
  },
  {
    id: 'journal-images',
    name: 'journal-images',
    public: false,
    description: 'Journal entry images'
  },
  {
    id: 'exercise-photos',
    name: 'exercise-photos',
    public: false,
    description: 'Exercise and workout photos'
  },
  {
    id: 'progress-photos',
    name: 'progress-photos',
    public: false,
    description: 'Fitness progress photos'
  },
  {
    id: 'memories',
    name: 'memories',
    public: false,
    description: 'Memory images and photos'
  },
  {
    id: 'visualizations',
    name: 'visualizations',
    public: false,
    description: 'Goal visualization images'
  },
  {
    id: 'documents',
    name: 'documents',
    public: false,
    description: 'Document storage'
  }
]

async function createBucket(bucket) {
  try {
    console.log(`📁 Creating bucket: ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    
    const { data, error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
      allowedMimeTypes: bucket.id === 'documents' 
        ? ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        : ['image/*']
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Bucket ${bucket.name} already exists`)
        return true
      } else {
        console.error(`❌ Error creating bucket ${bucket.name}:`, error.message)
        return false
      }
    }

    console.log(`✅ Successfully created bucket: ${bucket.name}`)
    return true
  } catch (error) {
    console.error(`❌ Exception creating bucket ${bucket.name}:`, error.message)
    return false
  }
}

async function verifyBuckets() {
  try {
    console.log('\n🔍 Verifying buckets...')
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message)
      return false
    }

    console.log('\n📋 Current buckets:')
    data.forEach(bucket => {
      const isExpected = buckets.find(b => b.id === bucket.id)
      const status = isExpected ? '✅' : '⚠️'
      console.log(`${status} ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    // Check if all expected buckets exist
    const existingBucketIds = data.map(b => b.id)
    const missingBuckets = buckets.filter(b => !existingBucketIds.includes(b.id))
    
    if (missingBuckets.length > 0) {
      console.log('\n❌ Missing buckets:')
      missingBuckets.forEach(bucket => {
        console.log(`   - ${bucket.name}`)
      })
      return false
    }

    console.log('\n✅ All required buckets exist!')
    return true
  } catch (error) {
    console.error('❌ Exception verifying buckets:', error.message)
    return false
  }
}

async function setupStorage() {
  console.log('🚀 Starting Supabase Storage Setup...\n')

  let success = true

  // Create all buckets
  for (const bucket of buckets) {
    const created = await createBucket(bucket)
    if (!created) {
      success = false
    }
  }

  // Verify setup
  const verified = await verifyBuckets()
  if (!verified) {
    success = false
  }

  console.log('\n' + '='.repeat(50))
  
  if (success) {
    console.log('✅ Storage setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Run the storage policies SQL in your Supabase dashboard:')
    console.log('   Copy and paste the contents of supabase-storage-setup.sql')
    console.log('2. Test file uploads in your application')
    console.log('3. Verify storage access controls are working')
  } else {
    console.log('❌ Storage setup completed with errors!')
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your environment variables')
    console.log('2. Ensure you have service role permissions')
    console.log('3. Check Supabase project status')
    process.exit(1)
  }
}

// Run the setup
setupStorage().catch(error => {
  console.error('❌ Fatal error during storage setup:', error)
  process.exit(1)
})
