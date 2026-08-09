# Demo Users Setup Guide

This guide explains how to set up demo Admin and Dealer accounts for testing the Dealer Panel.

## Authentication Implementation

The project uses **Supabase Authentication** with the following architecture:

- **Auth Provider**: Supabase Auth (email/password)
- **Role-Based Access**: Stored in `profiles` table with `role` column (ADMIN, DEALER)
- **Middleware Protection**: Route protection via `middleware.ts`
- **Session Management**: Supabase SSR with cookie-based sessions

## Demo User Credentials

### Admin Account
- **Email**: `admin@feenixrepair.com`
- **Password**: `Admin@123`
- **Role**: ADMIN
- **Access**: Full administrative access to `/admin` routes

### Dealer Account
- **Email**: `dealer@feenixrepair.com`
- **Password**: `Dealer@123`
- **Role**: DEALER
- **Access**: Full dealer access to `/dealer` routes

## Setup Instructions

### Option 1: Using the Setup Script (Recommended)

1. **Configure Environment Variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **Important**: Use the **Service Role Key** (not the Anon Key) to create auth users. Get it from:
   - Supabase Dashboard → Project Settings → API → service_role (secret)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Setup Script**
   ```bash
   npm run setup:demo-users
   ```

   This script will:
   - Create auth users in Supabase Authentication
   - Auto-confirm their emails (no email verification required)
   - Insert their profiles into the `profiles` table with correct roles
   - Create sample category, brand, and model data

### Option 2: Manual Setup via Supabase Dashboard

1. **Create Auth Users**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add user" for each account:
     - **Admin**: Email: `admin@feenixrepair.com`, Password: `Admin@123`, Auto-confirm: ON
     - **Dealer**: Email: `dealer@feenixrepair.com`, Password: `Dealer@123`, Auto-confirm: ON

2. **Run SQL Migration**
   - Go to Supabase Dashboard → SQL Editor
   - Run the migration: `supabase/migrations/20240715000002_seed_demo_users.sql`
   - Replace the UUID placeholders with the actual user IDs from step 1

3. **Disable Email Confirmation (Optional)**
   - For local development, disable email confirmation:
   - Supabase Dashboard → Authentication → Providers → Email
   - Turn off "Confirm email"

## Login URLs

Both accounts use the same login page:
```
http://localhost:3000/auth/login
```

After successful login, users are redirected based on their role:
- **Admin**: Redirects to `/admin`
- **Dealer**: Redirects to `/dealer`

## Testing the Dealer Panel

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/auth/login`

3. Login with Dealer credentials:
   - Email: `dealer@feenixrepair.com`
   - Password: `Dealer@123`

4. You should be redirected to `/dealer` and see:
   - Dashboard with stats
   - Profile management
   - Products management
   - Inventory management

## Troubleshooting

### "Invalid login credentials"
- Ensure the user was created in Supabase Authentication
- Check email confirmation is disabled or user is confirmed
- Verify password is correct

### "Redirected to unauthorized"
- Check the user's role in the `profiles` table
- Ensure role is set to 'DEALER' or 'ADMIN'
- Run the setup script again if profile is missing

### Script fails with "Missing Supabase credentials"
- Ensure `.env.local` exists with all required variables
- Use the Service Role Key (not Anon Key)
- Check the Supabase URL is correct

## Files Created

- `scripts/setup-demo-users.ts` - Automated setup script
- `supabase/migrations/20240715000002_seed_demo_users.sql` - SQL migration
- `.env.example` - Updated with service role key placeholder

## Security Notes

⚠️ **Important Security Warning**:
- Never commit the Service Role Key to version control
- The Service Role Key has full admin access to your Supabase project
- Only use it for server-side operations and setup scripts
- For production, use proper user signup flows instead of hardcoded demo users
