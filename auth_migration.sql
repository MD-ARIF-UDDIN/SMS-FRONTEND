-- Auth System Migration (idempotent version)
-- profiles.id is already linked to auth.users(id) — skip structural changes
-- Only need: trigger function + trigger

-- Trigger function: auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name_en)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_app_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate trigger (drop first to make idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Keep RLS disabled (open access as per existing schema)
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
