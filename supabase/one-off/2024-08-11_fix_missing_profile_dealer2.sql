-- ============================================================================
-- One-time data fix: create the missing public.profiles row for the
-- existing auth.users account dealer2@gmail.com.
--
-- This is NOT a schema migration - it does not create/alter any table,
-- enum, trigger, function, or RLS policy. It only inserts one row, and
-- only if it doesn't already exist. Safe to run more than once.
--
-- Root cause (see prior read-only report): there is no active
-- handle_new_user trigger on auth.users (it exists only as commented-out
-- SQL in feenix_repair_complete_schema.sql), and this account's signup
-- path did not separately create a profiles row the way
-- scripts/setup-demo-users.ts does for the working demo dealer account.
-- This script does NOT enable that trigger and does NOT touch the
-- registration flow - it only backfills this one profile.
-- ============================================================================

INSERT INTO public.profiles (
  id,
  role,
  name,
  business_name,
  email,
  phone,
  country,
  is_active
)
SELECT
  u.id,
  'DEALER',
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  u.raw_user_meta_data->>'business_name',
  u.email,
  u.raw_user_meta_data->>'phone',
  'India',
  true
FROM auth.users u
WHERE u.email = 'dealer2@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- Verification query (read-only, safe to run before/after):
-- SELECT p.* FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE u.email = 'dealer2@gmail.com';
