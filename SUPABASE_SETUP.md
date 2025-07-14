# Supabase Setup Instructions

This document provides step-by-step instructions for setting up Supabase for the Negro Industries activity logging system.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `negro-industries-logging`
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (usually takes 1-2 minutes)

## 2. Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the contents of `lib/database-schema.sql` from this project
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema creation
5. Verify the `activity_logs` table was created in the **Table Editor**

## 3. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 4. Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: 
- Replace the placeholder values with your actual Supabase credentials
- Never commit the `.env.local` file to version control
- The `.env.local` file is already included in `.gitignore`

## 5. Test the Connection

1. Start your development server: `pnpm dev`
2. The Supabase client should now be able to connect to your database
3. You can test the connection by using the `activityLogService` functions in your components

## 6. Optional: Set Up Row Level Security (RLS)

The schema includes basic RLS policies, but you may want to customize them based on your authentication requirements:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Review the policies for the `activity_logs` table
3. Modify them as needed for your security requirements

## 7. Sample Usage

```typescript
import { activityLogService } from '@/types/supabase'

// Create a new log entry
const newLog = await activityLogService.create({
  timestamp: new Date().toISOString(),
  event_type: 'user_action',
  source: 'web_app',
  user_id: 'user123',
  metadata: { action: 'button_click', page: '/dashboard' }
})

// Get all logs
const logs = await activityLogService.getAll({ limit: 10 })

// Subscribe to real-time updates
const subscription = activityLogService.subscribeToLogs((payload) => {
  console.log('New activity log:', payload)
})
```

## Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure your API keys haven't expired

### Permission Errors
- Check your RLS policies in the Supabase dashboard
- Verify the user has the correct permissions
- Review the authentication setup

### Schema Issues
- Ensure the SQL schema was executed successfully
- Check for any error messages in the SQL Editor
- Verify all indexes and triggers were created

## Next Steps

After completing this setup:
1. Test the CRUD operations work correctly
2. Implement error handling in your application
3. Set up monitoring and logging for production use
4. Consider implementing database backups and migrations 