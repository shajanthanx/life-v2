# Supabase Setup Guide

This guide will help you set up Supabase for your Life Management Dashboard.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `life-management-dashboard`
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users

## 2. Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Get your project credentials from the Supabase dashboard:
   - Go to Settings > API
   - Copy the Project URL and anon/public key

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to create all tables and policies

## 4. Set Up Storage Buckets

### Quick Setup (Recommended)

**Option 1: Automated Setup**
1. Set your environment variables (see step 2 above)
2. Run the automated storage setup:
   ```bash
   npm run setup-storage
   ```
3. Apply storage policies by running `supabase-storage-setup.sql` in your Supabase SQL Editor

**Option 2: Manual Setup**
Follow the complete guide in `STORAGE_SETUP_COMPLETE.md` for detailed step-by-step instructions.

### Required Storage Buckets

Your application needs these 7 storage buckets:

| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | ✅ | User profile pictures |
| `journal-images` | ❌ | Journal entry photos |
| `exercise-photos` | ❌ | Workout photos |
| `progress-photos` | ❌ | Fitness progress images |
| `memories` | ❌ | Memory photos |
| `visualizations` | ❌ | Goal visualization images |
| `documents` | ❌ | Document storage |

### Storage Policies

After creating buckets, run the complete storage policies from `supabase-storage-setup.sql` in your Supabase SQL Editor. This file contains all necessary RLS policies for secure file access.

## 5. Configure Authentication

### Enable Email Authentication

1. Go to Authentication > Settings
2. Enable "Enable email confirmations" (recommended)
3. Set up your email templates if desired
4. Configure redirect URLs for password reset

### Optional: Set Up Additional Auth Providers

You can enable Google, GitHub, or other OAuth providers:
1. Go to Authentication > Providers
2. Enable desired providers
3. Configure OAuth credentials

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Check if you can log in
4. Verify that data is being saved to Supabase
5. Test image uploads

## 7. Production Considerations

### Database Performance
- Monitor query performance in the Supabase dashboard
- Add additional indexes if needed for frequently queried columns
- Consider upgrading to a paid plan for better performance

### Storage Limits
- Free tier: 1GB storage
- Monitor storage usage in the dashboard
- Implement image compression and cleanup policies

### Security
- Regularly review RLS policies
- Monitor auth logs for suspicious activity
- Keep dependencies updated

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your domain is added to the allowed origins in Supabase settings
2. **RLS Policy Errors**: Check that all tables have proper Row Level Security policies
3. **Storage Upload Failures**: Verify bucket names and storage policies
4. **Auth Issues**: Check that environment variables are correctly set

### Getting Help

- Supabase Documentation: https://supabase.com/docs
- Community Support: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com

## Migration from localStorage

If you have existing data in localStorage, you'll need to manually export and import it:

1. Before migration, use the export function to save your data
2. After setting up Supabase, you can manually recreate important data
3. Note: Images will need to be re-uploaded as they were stored as base64 in localStorage

The app now automatically saves all new data to Supabase instead of localStorage.
