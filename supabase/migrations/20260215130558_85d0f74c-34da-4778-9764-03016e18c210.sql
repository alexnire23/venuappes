
-- Insert new categories
INSERT INTO public.categories (name, slug, "order", active, description_short)
VALUES
  ('Mostaza antigua', 'mostaza-antigua', 8, true, 'Mostaza a la antigua'),
  ('Mostaza Dijon', 'mostaza-dijon', 9, true, 'Mostaza Dijon'),
  ('Salsa de tomate', 'salsa-tomate', 10, true, 'Salsa de tomate natural'),
  ('Helados', 'helados', 11, true, 'Helados'),
  ('Pan de molde', 'pan-de-molde', 12, true, 'Pan de molde');

-- Mostaza antigua: primary product
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Mostaza antigua Hacendado',
  'Hacendado',
  'Mercadona',
  (SELECT id FROM public.categories WHERE slug = 'mostaza-antigua'),
  'primary',
  1,
  true,
  'mostaza_antigua_hacendado.jpg',
  'Agua, semillas de mostaza, vinagre, sal, cúrcuma',
  ARRAY[
    'Ingredientes reconocibles y tradicionales',
    'Sin aceites de semillas ni espesantes',
    'Sabor auténtico con semillas de mostaza enteras'
  ]
);

-- Mostaza Dijon: primary product
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Mostaza Dijon Hacendado',
  'Hacendado',
  'Mercadona',
  (SELECT id FROM public.categories WHERE slug = 'mostaza-dijon'),
  'primary',
  1,
  true,
  'mostaza_dijon_hacendado.jpg',
  'Agua, semillas de mostaza, vinagre, sal',
  ARRAY[
    'Lista de ingredientes corta y limpia',
    'Sin aditivos ni conservantes artificiales',
    'Mostaza clásica con ingredientes reales'
  ]
);

-- Salsa de tomate albahaca: primary product
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Salsa de tomate con albahaca Hacendado',
  'Hacendado',
  'Mercadona',
  (SELECT id FROM public.categories WHERE slug = 'salsa-tomate'),
  'primary',
  1,
  true,
  'salsa_tomate_albahaca_hacendado.jpg',
  'Tomate, albahaca, aceite de oliva, sal',
  ARRAY[
    'Tomate y albahaca como ingredientes principales',
    'Sin azúcares añadidos ni almidones',
    'Ingredientes que usarías en casa'
  ]
);

-- No products for helados and pan-de-molde (intentionally empty)
