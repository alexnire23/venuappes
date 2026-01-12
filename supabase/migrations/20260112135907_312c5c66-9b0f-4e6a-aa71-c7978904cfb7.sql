-- Drop and recreate the trigger to ensure it works correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_paid, free_uses_remaining)
  VALUES (NEW.id, NEW.email, false, 3)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix existing users who have 0 free uses and haven't paid (reset to 3 if they never used the app properly)
UPDATE public.profiles 
SET free_uses_remaining = 3 
WHERE is_paid = false 
AND free_uses_remaining = 0;