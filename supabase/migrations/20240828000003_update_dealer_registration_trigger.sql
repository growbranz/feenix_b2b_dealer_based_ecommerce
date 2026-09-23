-- Update or create trigger to handle new user registration with proper dealer status
-- This ensures new dealers start with PENDING status

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace function to handle new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Determine role from user metadata or default to DEALER
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'DEALER'
  );

  -- Insert profile with proper dealer status
  INSERT INTO public.profiles (
    id,
    role,
    name,
    email,
    phone,
    business_name,
    dealer_status,
    is_active
  )
  VALUES (
    NEW.id,
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'business_name',
    CASE 
      WHEN user_role = 'DEALER' THEN 'PENDING'::dealer_status
      ELSE NULL
    END,
    CASE 
      WHEN user_role = 'ADMIN' THEN true
      ELSE false  -- Dealers start as inactive until verified
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add comment
COMMENT ON FUNCTION handle_new_user() IS 'Creates profile entry for new auth users. Dealers start with PENDING status and inactive until verified.';
