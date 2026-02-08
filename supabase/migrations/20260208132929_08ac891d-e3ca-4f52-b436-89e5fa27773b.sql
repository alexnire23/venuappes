
-- Insert new categories
INSERT INTO public.categories (name, slug, "order", active, description_short)
VALUES
  ('Avena', 'avena', 6, true, 'Copos de avena integrales'),
  ('Cereales', 'cereales', 7, true, 'Cereales de desayuno simples');

-- Insert Avena primary product (no alternative)
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES
  (
    'Copos de avena Brüggen',
    'Brüggen',
    'Mercadona',
    (SELECT id FROM public.categories WHERE slug = 'avena'),
    'primary',
    1,
    true,
    'copos_avena_bruggen.jpg',
    'Copos de avena integral',
    ARRAY[
      'Copos de avena integral como único ingrediente',
      'Ingrediente real, reconocible y de uso cotidiano',
      'Sin aceites de semillas ni aditivos innecesarios'
    ]
  );

-- Insert Cereales primary product
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES
  (
    'Corn Flakes Hacendado 0%',
    'Hacendado',
    'Mercadona',
    (SELECT id FROM public.categories WHERE slug = 'cereales'),
    'primary',
    1,
    true,
    'corn_flakes_hacendado_0.jpg',
    'Maíz, sal',
    ARRAY[
      'Maíz como ingrediente principal, sin mezclas innecesarias',
      'Lista de ingredientes corta y reconocible',
      'Sin aceites de semillas ni aromas'
    ]
  );

-- Insert Cereales alternative product
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES
  (
    'Copos de trigo integral y arroz 0%',
    'Hacendado',
    'Mercadona',
    (SELECT id FROM public.categories WHERE slug = 'cereales'),
    'alternative',
    2,
    true,
    'cereales_trigo_arroz_0.jpg',
    'Trigo integral, arroz',
    ARRAY[
      'Cereales integrales sencillos y familiares',
      'Sin azúcares añadidos ni ingredientes artificiales',
      'Buena opción si no encuentras el producto recomendado'
    ]
  );
