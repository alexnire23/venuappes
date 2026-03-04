
-- Swap primary/alternative roles for tomate-frito in Carrefour
-- Hida becomes primary, Carrefour Bio becomes alternative

UPDATE public.products
SET role = 'primary', rank = 1
WHERE supermarket = 'Carrefour'
  AND category_id = (SELECT id FROM public.categories WHERE slug = 'tomate-frito')
  AND name_exact = 'Tomate Frito Ecológico Hida tarro 350g';

UPDATE public.products
SET role = 'alternative', rank = 2
WHERE supermarket = 'Carrefour'
  AND category_id = (SELECT id FROM public.categories WHERE slug = 'tomate-frito')
  AND name_exact = 'Tomate Frito Ecológico Carrefour Bio tarro 340g';
