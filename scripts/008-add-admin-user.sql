-- Add Admin User
-- Replace 'YOUR_USER_ID_HERE' with your actual Supabase user ID
-- You can find your user ID by logging in and checking the auth.users table
-- Or by running: SELECT id, email FROM auth.users;

-- First, let's create a helpful comment
-- To find your user ID, you can:
-- 1. Log into your app
-- 2. Check the Supabase dashboard > Authentication > Users
-- 3. Copy your User UID

-- Example: INSERT INTO public.admins (user_id, email, created_at)
-- VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@example.com', NOW());

-- Add your admin user here:
-- IMPORTANT: Replace the values below with your actual user ID and email

INSERT INTO public.admins (user_id, email, created_at)
VALUES (
  '1b33d5d1-56ee-4d22-80ad-761244c17b17',  -- Replace with your actual Supabase user ID
  'accraprize@gmail.com',  -- Replace with your email
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- To find your user ID, run this query in Supabase SQL Editor:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
