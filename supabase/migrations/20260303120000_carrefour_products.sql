
-- Insert Carrefour products for all supported categories
-- Categories already exist in the DB; we just add products with supermarket = 'Carrefour'

-- 01. PATATAS FRITAS -----------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Patatas Fritas en Aceite de Oliva Ecológicas Carrefour Bio 100g',
  'Carrefour Bio',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'patatas-fritas'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-prod920382_01.jpg',
  'Patata* (61%), aceite de oliva virgen extra* (39%), sal. *ecológico. Origen España.',
  ARRAY[
    'Solo 3 ingredientes: patata eco, AOVE (39%), sal',
    'Patatas origen España, ingredientes ecológicos certificados',
    'Sin colorantes, sin aromas, sin nada más'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Patatas Fritas en Aceite de Oliva Virgen Extra Frit Ravich 160g',
  'Frit Ravich',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'patatas-fritas'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-530305149_01.jpg',
  'Patatas, aceite de oliva virgen extra (30%), sal.',
  ARRAY[
    '3 ingredientes: patatas, AOVE (30%), sal',
    'Bolsa más grande, precio razonable',
    'Si el formato 100g de Bio se queda corto'
  ]
);


-- 02. YOGUR NATURAL ------------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Yogur Natural Cremoso Carrefour Sensation 500g',
  'Carrefour Sensation',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'yogur-natural'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-VC4AECOMM-549359_01.jpg',
  'Leche entera pasteurizada, fermentos lácticos.',
  ARRAY[
    'Solo 2 ingredientes: leche entera pasteurizada + fermentos',
    'Sin leche en polvo añadida, sin espesantes',
    'El más limpio de toda la categoría'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Yogur Natural Danone pack 4x120g',
  'Danone',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'yogur-natural'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-521029387_01.jpg',
  'Leche fresca pasteurizada (99,1%), leche en polvo desnatada, fermentos lácticos.',
  ARRAY[
    'Leche fresca pasteurizada (99,1%), sin aditivos',
    'Fermentos propios, leche de origen España',
    'Mejor si prefieres formato individual'
  ]
);


-- 03. TOMATE FRITO -------------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Tomate Frito Ecológico Carrefour Bio tarro 340g',
  'Carrefour Bio',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'tomate-frito'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-526538957_01.jpg',
  'Tomate* 85%, AOVE* (3,9%), cebolla*, puerro*, azúcar de caña*, sal, ajo*, ácido cítrico. *ecológico.',
  ARRAY[
    'Con azúcar de caña (no azúcar refinado), sin almidón ni aromas',
    'AOVE + cebolla + ajo reales, sin almidón modificado',
    'Todo ecológico certificado'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Tomate Frito Ecológico Hida tarro 350g',
  'Hida',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'tomate-frito'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-826900524_01.jpg',
  'Tomate* (138g/100g), AOVE* (5,1%), azúcar de caña*, sal. *ecológico.',
  ARRAY[
    'Solo 4 ingredientes: tomate, AOVE (5,1%), azúcar de caña, sal',
    'Sin almidón modificado, sin aceite de girasol',
    'Más fácil de encontrar en el lineal, precio menor'
  ]
);


-- 04. GALLETAS -----------------------------------------------------------------

-- Primary only (única opción válida, sin alternativa)
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Galletas de Mantequilla Ecológicas Carrefour Bio 167g',
  'Carrefour Bio',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'galletas-simples'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-858200344_01.jpg',
  'Harina trigo* 70%, azúcar moreno de caña*, mantequilla* 14%, leche desnatada en polvo*, gasificantes, sal, aromas naturales. *ecológico.',
  ARRAY[
    'Sin aceite de palma ni girasol: la grasa es mantequilla real',
    'Sin jarabe de glucosa-fructosa: única galleta en Carrefour que cumple',
    'Harina, azúcar de caña, mantequilla, leche: todo eco'
  ]
);


-- 05. HUEVOS ------------------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Huevos Camperos Círculo de Calidad 12ud',
  'Carrefour Círculo de Calidad',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'huevos'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-prod970492_01.jpg',
  'Huevo fresco de gallina campera. Categoría A. Código 1. Origen España.',
  ARRAY[
    'Código 1 (campero): gallinas con acceso al exterior',
    'Categoría A, calibre L, origen España',
    'Precio estándar, siempre disponible'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Huevos Ecológicos Carrefour Bio 10ud',
  'Carrefour Bio',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'huevos'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-VC4AECOMM-500117_01.jpg',
  'Huevo fresco de gallina ecológica. Categoría A. Código 0. Origen España.',
  ARRAY[
    'Código 0 (ecológico): máximo estándar de bienestar animal',
    'Certificación bio, origen España',
    'Si quieres subir un nivel sin complicarte'
  ]
);


-- 06. AVENA -------------------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Copos de Avena Integral Original Carrefour 500g',
  'Carrefour',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'avena'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-641402048_01.jpg',
  '100% copos de avena integral.',
  ARRAY[
    '1 único ingrediente: 100% copos de avena integral',
    'Precio mínimo, siempre en lineal',
    'No hay nada mejor en esta categoría'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Copos de Avena 100% Integral Quaker 500g',
  'Quaker',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'avena'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-521005456_01.jpg',
  '100% copos de avena integral.',
  ARRAY[
    'Mismos ingredientes que la marca blanca',
    'Envase más reconocible en el lineal',
    'Ligero sobrecoste sin ninguna diferencia real'
  ]
);


-- 07. CEREALES ----------------------------------------------------------------
-- Sin recomendación para Carrefour: no se insertan productos


-- 08. MOSTAZA ANTIGUA ---------------------------------------------------------

-- Primary only (sin alternativa)
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Mostaza sin Azúcar Añadido Ecológica Ecocesta tarro 200g',
  'Ecocesta',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'mostaza-antigua'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-590205743_01.jpg',
  'Semillas de mostaza*, vinagre de manzana*, agua, sal marina, cúrcuma*. *ecológico.',
  ARRAY[
    'Sin azúcar añadido, sin conservadores artificiales',
    '5 ingredientes eco: semillas, vinagre manzana, agua, sal, cúrcuma',
    'Maille Antigua lleva azúcar + metabisulfito: Ecocesta gana claro'
  ]
);


-- 09. MOSTAZA DIJON -----------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Mostaza de Dijon Carrefour Classic frasco 200g',
  'Carrefour Classic',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'mostaza-dijon'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-521004609_01.jpg',
  'Agua, semillas de mostaza, vinagre de alcohol, sal, ácido cítrico, metabisulfito potásico.',
  ARRAY[
    'Mismos ingredientes que Maille, precio más bajo',
    'El metabisulfito es estándar en toda mostaza Dijon',
    'Sin diferencia real con marcas más caras'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Mostaza de Dijon Maille tarro 215g',
  'Maille',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'mostaza-dijon'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-521029219_01.jpg',
  'Agua, semillas de mostaza, vinagre de alcohol, sal, ácido cítrico, metabisulfito potásico.',
  ARRAY[
    'Ingredientes idénticos a la marca blanca',
    'Tarro de cristal reutilizable',
    'Solo si prefieres el envase o la marca'
  ]
);


-- 10. SALSA DE TOMATE ---------------------------------------------------------

-- Primary only (sin alternativa)
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Salsa de Tomate De la Abuela Carrefour tarro 300g',
  'Carrefour',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'salsa-tomate'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-800416264_01.jpg',
  'Tomate (78%), aceite de oliva (15%), azúcar, sal, ajo, ácido cítrico.',
  ARRAY[
    'Aceite de oliva (15%): única en la categoría sin aceite de girasol',
    'Sin almidón modificado, 6 ingredientes reales',
    'Helios descartada: girasol + jarabe de glucosa'
  ]
);


-- 11. HELADOS -----------------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Helado de Vainilla Häagen-Dazs 460ml',
  'Häagen-Dazs',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'helados'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-prod1000109_01.jpg',
  'Nata pasteurizada (39%), leche evaporada desnatada, azúcar, yema de huevo, extracto de vainilla.',
  ARRAY[
    'Solo 5 ingredientes: nata, leche, azúcar, yema de huevo, vainilla',
    'Sin jarabes, sin estabilizantes, sin emulgentes',
    'Magnum, Cornetto, Carrefour: todos descartados'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Helado de Fresas y Crema Häagen-Dazs 460ml',
  'Häagen-Dazs',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'helados'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-prod1000106_01.jpg',
  'Nata pasteurizada (36%), leche evaporada desnatada, fresas (21%), azúcar, yema de huevo.',
  ARRAY[
    '5 ingredientes: nata, leche, fresas (21%), azúcar, yema de huevo',
    'Igual de limpio que la vainilla, sabor frutal',
    'Atención: Dulce de Leche y Caramelo Salado no valen (jarabe de glucosa)'
  ]
);


-- 12. PAN DE MOLDE ------------------------------------------------------------

-- Primary
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Pan de Molde Natural 100% Bimbo con Corteza 460g',
  'Bimbo',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'pan-de-molde'),
  'primary',
  1,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-fprod1330001_01.jpg',
  'Harina de trigo (67%), agua (26%), levadura (3,5%), aceite de oliva (1,7%), sal, masa madre inactiva de trigo y centeno integral, harina fermentada de maíz. Sin aditivos.',
  ARRAY[
    'Sin conservadores, sin emulgentes: único pan de molde en Carrefour que cumple',
    'Aceite de oliva (1,7%), no girasol',
    'Todo Bimbo normal y Carrefour llevan E-282 y E-471'
  ]
);

-- Alternative
INSERT INTO public.products (name_exact, brand, supermarket, category_id, role, rank, active, image_key, ingredients, why_recommended)
VALUES (
  'Pan de Molde Sin Corteza Natural 100% Bimbo 450g',
  'Bimbo',
  'Carrefour',
  (SELECT id FROM public.categories WHERE slug = 'pan-de-molde'),
  'alternative',
  2,
  true,
  'https://static.carrefour.es/hd_510x_/img_pim_food/R-fprod1330003_01.jpg',
  'Harina de trigo (68%), agua (24%), levadura (3,6%), aceite de oliva (1,3%), sal, masa madre inactiva de centeno y trigo, harina fermentada de maíz. Sin aditivos.',
  ARRAY[
    'Misma fórmula limpia, formato sin corteza',
    'Aceite de oliva (1,3%), sin aditivos ni conservantes',
    'Si prefieres rebanadas sin borde para bocadillos'
  ]
);
