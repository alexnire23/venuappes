-- Change free_uses_remaining default from 3 to 1
ALTER TABLE public.profiles
  ALTER COLUMN free_uses_remaining SET DEFAULT 1;

-- Update existing non-paid users who still have the old default of 3
UPDATE public.profiles
SET free_uses_remaining = 1
WHERE is_paid = false
  AND free_uses_remaining = 3;
