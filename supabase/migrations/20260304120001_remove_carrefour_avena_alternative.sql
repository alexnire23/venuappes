
-- Remove Quaker alternative for avena in Carrefour
DELETE FROM public.products
WHERE supermarket = 'Carrefour'
  AND category_id = (SELECT id FROM public.categories WHERE slug = 'avena')
  AND role = 'alternative';
