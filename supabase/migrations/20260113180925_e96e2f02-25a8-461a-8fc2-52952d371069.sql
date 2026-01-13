-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new restrictive UPDATE policy that ONLY allows email updates
-- This prevents client-side manipulation of is_paid and free_uses_remaining
CREATE POLICY "Users can update their own profile email only" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Ensure is_paid cannot be changed by user
  is_paid = (SELECT p.is_paid FROM public.profiles p WHERE p.id = auth.uid()) AND
  -- Ensure free_uses_remaining cannot be changed by user  
  free_uses_remaining = (SELECT p.free_uses_remaining FROM public.profiles p WHERE p.id = auth.uid())
);