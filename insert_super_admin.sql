-- ==========================================
-- HACK: INSERT SUPER ADMIN VIA RAW SQL
-- ==========================================
-- This script creates a user directly in the hidden 'auth' schema 
-- and then links it to the 'public.users' table.
-- 
-- DEFAULT CREDENTIALS:
-- Email: vishvvegada53@gmail.com
-- Password: admin@123
-- ==========================================

DO $$
DECLARE
  existing_user_id UUID;
  admin_role_id INT;
BEGIN
  -- 1. Find the existing user in auth.users
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'vishvvegada53@gmail.com' LIMIT 1;

  -- If the user doesn't exist, we can't elevate them!
  IF existing_user_id IS NULL THEN
    RAISE EXCEPTION 'User vishvvegada53@gmail.com not found in auth.users! Did you delete them?';
  END IF;

  -- 2. Get the super_admin role ID
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'super_admin';

  -- 3. Update their password just in case you forgot it (Sets it to admin@123)
  UPDATE auth.users 
  SET encrypted_password = crypt('admin@123', gen_salt('bf'))
  WHERE id = existing_user_id;

  -- 4. Insert or update our custom public.users table to make them a super admin
  INSERT INTO public.users (id, name, email, role_id)
  VALUES (existing_user_id, 'Super Admin', 'vishvvegada53@gmail.com', admin_role_id)
  ON CONFLICT (id) DO UPDATE 
  SET role_id = EXCLUDED.role_id,
      name = EXCLUDED.name;

  -- 5. VERY IMPORTANT: Disable Row Level Security (RLS) so the Next.js app can actually read the data!
  -- If RLS is enabled without policies, the app will think your user doesn't exist.
  ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

END $$;
