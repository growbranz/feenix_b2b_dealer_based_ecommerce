-- ============================================================================
-- Auto-create profile on user registration
-- ============================================================================
-- This migration:
-- 1. Removes the DEFAULT uuid_generate_v4() from profiles.id to allow auth.users.id
-- 2. Adds foreign key constraint from profiles.id to auth.users(id) with ON DELETE CASCADE
-- 3. Creates a function to automatically create a profile when a new auth user is created
-- 4. Creates a trigger to call this function AFTER INSERT on auth.users
-- 5. Ensures proper RLS policies are in place
-- ============================================================================

-- Step 1: Remove the DEFAULT value from profiles.id to allow it to be set to auth.users.id
-- This is safe because existing rows already have their IDs set
ALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;

-- Step 2: Add foreign key constraint from profiles.id to auth.users(id) with ON DELETE CASCADE
-- Check if the constraint already exists to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'profiles_id_fkey' 
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 3: Create helper function to check if current user is admin
-- This avoids circular queries in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- Step 4: Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile only if it doesn't already exist
  INSERT INTO public.profiles (
    id,
    role,
    name,
    business_name,
    email,
    phone,
    is_active
  )
  VALUES (
    NEW.id,
    'DEALER',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'business_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- Step 5: Create trigger to call the function AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Ensure RLS policies are properly set up
-- Drop existing policies if they exist to avoid duplicates
DROP POLICY IF EXISTS profiles_select_own_or_admin ON profiles;
DROP POLICY IF EXISTS profiles_insert_own_or_admin ON profiles;
DROP POLICY IF EXISTS profiles_update_own_or_admin ON profiles;
DROP POLICY IF EXISTS profiles_delete_admin ON profiles;
DROP POLICY IF EXISTS profiles_public_read_for_active_products ON profiles;

-- Create policy for users to read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for admins to read all profiles
CREATE POLICY profiles_select_admin ON profiles
  FOR SELECT
  USING (public.is_admin());

-- Create policy for users to insert their own profile (for the trigger)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policy for admins to insert profiles
CREATE POLICY profiles_insert_admin ON profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Create policy for users to update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy for admins to update all profiles
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Create policy for admins to delete profiles
CREATE POLICY profiles_delete_admin ON profiles
  FOR DELETE
  USING (public.is_admin());

-- Create policy to allow public read of profiles referenced by active products
-- This is required for the public product catalog to show dealer information
CREATE POLICY profiles_public_read_for_active_products ON profiles
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.dealer_id = profiles.id
      AND products.status = 'ACTIVE'
    )
  );
