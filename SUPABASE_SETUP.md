# Supabase Setup Guide

This guide will help you set up Supabase authentication and database for the eBay profit tracking app.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. Git access to this repository

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: "eBay Profit Dashboard"
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Your Project Credentials

1. Go to Project Settings > API
2. Copy these values:
   - Project URL
   - Project API keys (anon/public key)
   - Service role key (keep this secret!)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Update the Supabase configuration:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=your-database-url-here
```

To get the DATABASE_URL:
1. Go to Project Settings > Database
2. Copy the connection string under "Connection pooling"
3. Replace `[YOUR-PASSWORD]` with your database password

## Step 4: Set Up the Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `src/lib/supabase/migrations/001_initial_schema.sql`
3. Click "Run" to execute the SQL

This will create:
- User profiles table
- Transactions table with user isolation
- User settings table
- Row Level Security (RLS) policies
- Automatic profile/settings creation triggers

## Step 5: Configure Authentication Providers

### Email Authentication (Enabled by default)
No additional setup needed.

### Google OAuth (Optional but recommended)

1. Go to Authentication > Providers > Google
2. Enable Google provider
3. Set up Google OAuth credentials:
   - Go to Google Cloud Console
   - Create a new project or use existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
4. Copy Client ID and Client Secret to Supabase
5. Save configuration

## Step 6: Set Up Row Level Security Policies

The migration script automatically sets up RLS policies, but verify they're working:

1. Go to Authentication > Policies
2. Verify these tables have policies:
   - `profiles`: Users can only see/edit their own profile
   - `transactions`: Users can only see/edit their own transactions
   - `user_settings`: Users can only see/edit their own settings

## Step 7: Test the Setup

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Try registering a new account
5. Verify you can log in and see the dashboard
6. Check that sample data is seeded for new users

## Step 8: Configure Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Invite user

## Step 9: Set Up Production Environment

For production deployment (Vercel, Netlify, etc.):

1. Add environment variables to your hosting platform
2. Update redirect URLs in Supabase:
   - Go to Authentication > URL Configuration
   - Add your production domain to Site URL
   - Add production redirect URLs

## Database Schema Overview

### Tables Created

1. **profiles** - User profile information
   - Links to Supabase auth.users
   - Stores display name, avatar, eBay user ID
   - RLS: Users can only access their own profile

2. **transactions** - eBay transaction data
   - Linked to user via user_id foreign key
   - Stores all transaction details, fees, profits
   - RLS: Users can only access their own transactions
   - Unique constraint on (user_id, ebay_transaction_id)

3. **user_settings** - User preferences and configuration
   - Sync settings, display preferences, notifications
   - eBay token storage (encrypted)
   - RLS: Users can only access their own settings

### Automatic Features

- **Auto-profile creation**: New users automatically get a profile and settings record
- **Updated timestamps**: All tables have auto-updating updated_at fields
- **Data isolation**: RLS ensures complete user data separation
- **Unique constraints**: Prevent duplicate eBay transactions per user

## Security Considerations

1. **Row Level Security**: All tables use RLS for data isolation
2. **API Key Management**: Service role key should never be exposed to client
3. **Environment Variables**: Keep `.env.local` out of version control
4. **HTTPS Only**: Always use HTTPS in production
5. **Token Encryption**: eBay tokens are stored encrypted in user_settings

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Make sure the migration SQL was executed successfully
   - Check the database schema in Supabase dashboard

2. **RLS policy errors**
   - Verify RLS policies are enabled and working
   - Check that user authentication is working

3. **Environment variable issues**
   - Double-check all environment variables are set correctly
   - Make sure to restart the development server after changes

4. **OAuth redirect errors**
   - Verify redirect URLs are configured in both Supabase and OAuth provider
   - Check that URLs match exactly (including http vs https)

### Getting Help

1. Check Supabase documentation: https://supabase.com/docs
2. Check the Supabase community: https://github.com/supabase/supabase/discussions
3. Review application logs for specific error messages

## Next Steps

After successful setup:

1. Customize user onboarding flow
2. Set up eBay API integration per user
3. Configure automated backups
4. Set up monitoring and alerting
5. Optimize database performance with indexes
6. Set up CI/CD pipeline for database migrations