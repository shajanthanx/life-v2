# Complete Supabase Storage Setup Guide

This guide provides everything you need to set up Supabase Storage for your Life Management Dashboard.

## 📁 Storage Buckets Overview

Your application uses 7 storage buckets for different types of content:

| Bucket Name | Public | Purpose | File Types |
|-------------|--------|---------|------------|
| `avatars` | ✅ Public | User profile pictures | Images |
| `journal-images` | 🔒 Private | Journal entry photos | Images |
| `exercise-photos` | 🔒 Private | Workout photos | Images |
| `progress-photos` | 🔒 Private | Fitness progress images | Images |
| `memories` | 🔒 Private | Memory photos | Images |
| `visualizations` | 🔒 Private | Goal visualization images | Images |
| `documents` | 🔒 Private | Document storage | Images, PDFs, Documents |

## 🚀 Quick Setup (Automated)

### Option 1: Automated Script Setup

1. **Set up your environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Run the automated setup script**:
   ```bash
   npm run setup-storage
   ```

3. **Apply storage policies** by copying and pasting the contents of `supabase-storage-setup.sql` into your Supabase SQL Editor.

4. **Verify setup** by running the storage health check in your application.

## 🔧 Manual Setup (Step by Step)

### Step 1: Create Storage Buckets

In your Supabase Dashboard, go to **Storage > Buckets** and create the following buckets:

#### 1. Avatars Bucket (Public)
- **Name**: `avatars`
- **Public**: ✅ Yes
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### 2. Journal Images Bucket (Private)
- **Name**: `journal-images`  
- **Public**: ❌ No
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*`

#### 3. Exercise Photos Bucket (Private)
- **Name**: `exercise-photos`
- **Public**: ❌ No
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*`

#### 4. Progress Photos Bucket (Private)
- **Name**: `progress-photos`
- **Public**: ❌ No
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*`

#### 5. Memories Bucket (Private)
- **Name**: `memories`
- **Public**: ❌ No
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*`

#### 6. Visualizations Bucket (Private)
- **Name**: `visualizations`
- **Public**: ❌ No
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*`

#### 7. Documents Bucket (Private)
- **Name**: `documents`
- **Public**: ❌ No
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*, application/pdf, text/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Step 2: Apply Storage Policies

Go to **Storage > Policies** and run the SQL from `supabase-storage-setup.sql` to create all necessary access policies.

## 🔍 Verification

### Automated Health Check

Your application includes built-in storage health checks. After setup, you can verify everything is working by:

```typescript
import { performStorageHealthCheck } from '@/lib/storage-check'

const healthCheck = await performStorageHealthCheck()
console.log('Storage Health:', healthCheck)
```

### Manual Verification

1. **Check buckets exist**:
   ```sql
   SELECT id, name, public, created_at 
   FROM storage.buckets 
   ORDER BY name;
   ```

2. **Check policies are applied**:
   ```sql
   SELECT policyname, cmd, bucket_id
   FROM storage.policies 
   ORDER BY bucket_id, policyname;
   ```

3. **Test file upload** in your application by:
   - Uploading a profile avatar
   - Adding an image to a journal entry
   - Uploading an exercise photo

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ All buckets use RLS policies
- ✅ Users can only access their own files
- ✅ File paths include user ID for isolation

### Access Control
- **Public buckets**: Anyone can read, only owners can write
- **Private buckets**: Only owners can read and write
- **Path-based security**: Files stored in user-specific folders

### File Organization
Files are stored with the following structure:
```
bucket-name/
├── user-id-1/
│   ├── subfolder/ (optional)
│   └── file.jpg
├── user-id-2/
│   ├── subfolder/ (optional)
│   └── file.jpg
```

## 📊 Storage Monitoring

### Usage Tracking
Monitor your storage usage with the built-in utilities:

```typescript
import { getStorageStats } from '@/lib/storage-check'

const stats = await getStorageStats()
console.log(`Total files: ${stats.totalFiles}`)
stats.bucketStats.forEach(bucket => {
  console.log(`${bucket.bucket}: ${bucket.fileCount} files`)
})
```

### Limits & Quotas
- **Free tier**: 1GB storage
- **Pro tier**: 100GB storage
- **File size limit**: 50MB per file (configurable)
- **Bandwidth**: Varies by plan

## 🛠️ Troubleshooting

### Common Issues

1. **Bucket creation fails**
   - Check service role permissions
   - Verify environment variables
   - Ensure unique bucket names

2. **File upload fails**
   - Check storage policies are applied
   - Verify file size limits
   - Check MIME type restrictions

3. **Access denied errors**
   - Verify RLS policies are correct
   - Check user authentication
   - Ensure file path includes user ID

4. **Policy errors**
   - Run policies SQL in correct order
   - Check for syntax errors
   - Verify bucket names match exactly

### Error Messages

| Error | Solution |
|-------|----------|
| `Bucket already exists` | Normal - bucket was already created |
| `Policy already exists` | Normal - policy was already applied |
| `Permission denied` | Check RLS policies and user auth |
| `File too large` | Reduce file size or increase limits |
| `Invalid MIME type` | Check allowed file types for bucket |

## 🔄 File Migration

If migrating from base64 images in localStorage:

1. **Extract base64 images** from your localStorage data
2. **Convert to File objects** using the utility functions
3. **Upload to appropriate buckets** using the storage service
4. **Update database records** with new file URLs
5. **Clean up old base64 data**

Example migration code:
```typescript
import { base64ToFile } from '@/lib/image-utils'
import { uploadImage } from '@/lib/storage-service'

// Convert base64 to file
const file = base64ToFile(base64String, 'image.jpg')

// Upload to Supabase Storage
const result = await uploadImage(file, 'journal-images')
if (result.data) {
  console.log('Uploaded:', result.data.url)
}
```

## 📈 Performance Optimization

### Image Optimization
- ✅ Automatic compression before upload
- ✅ Resizing for optimal storage
- ✅ Format optimization (JPEG for photos)
- ✅ Progressive loading support

### CDN Benefits
- ✅ Global CDN distribution
- ✅ Automatic caching
- ✅ Optimized delivery
- ✅ Bandwidth optimization

## 🚀 Next Steps

After completing storage setup:

1. **Test all upload functionality** in your application
2. **Monitor storage usage** in Supabase dashboard
3. **Set up backup strategies** for important files
4. **Consider upgrade plans** based on usage
5. **Implement file cleanup** policies for old files

Your Supabase Storage is now fully configured and ready for production use! 🎉
