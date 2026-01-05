-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_short TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name_exact TEXT NOT NULL,
  brand TEXT NOT NULL,
  supermarket TEXT NOT NULL DEFAULT 'Mercadona',
  ingredients TEXT,
  image_key TEXT,
  role TEXT NOT NULL CHECK (role IN ('primary', 'alternative')),
  rank INTEGER NOT NULL DEFAULT 1,
  why_recommended TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  free_uses_remaining INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scans table
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL CHECK (input_type IN ('image', 'text')),
  raw_input TEXT,
  categories_matched TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Categories: public read access
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);

-- Products: public read access
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Scans: users can only access their own scans
CREATE POLICY "Users can view their own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_paid, free_uses_remaining)
  VALUES (NEW.id, NEW.email, false, 3);
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data: Categories
INSERT INTO public.categories (name, slug, description_short, "order") VALUES
  ('Patatas fritas', 'patatas-fritas', 'Snacks de patata', 1),
  ('Yogur natural', 'yogur-natural', 'Lácteos fermentados', 2),
  ('Tomate frito', 'tomate-frito', 'Salsas de tomate', 3),
  ('Galletas simples', 'galletas-simples', 'Bollería básica', 4),
  ('Huevos', 'huevos', 'Huevos frescos', 5);

-- Insert seed data: Products
INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Patatas fritas 0% sal añadida Hacendado',
  'Hacendado',
  'Mercadona',
  'Patatas seleccionadas, aceite de oliva',
  'patatas_fritas_hacendado.jpg',
  'primary',
  1,
  ARRAY['Solo contiene patatas y aceite de oliva', 'Sin aceite de girasol', 'Sin aditivos']
FROM public.categories c WHERE c.slug = 'patatas-fritas';

INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Yogur natural Hacendado',
  'Hacendado',
  'Mercadona',
  'Leche, fermentos lácticos',
  'yogur_natural_hacendado.jpg',
  'primary',
  1,
  ARRAY['Solo contiene leche y fermentos', 'Sin edulcorantes', 'Sin aditivos ni espesantes']
FROM public.categories c WHERE c.slug = 'yogur-natural';

INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Yogur natural griego Hacendado',
  'Hacendado',
  'Mercadona',
  'Leche, fermentos lácticos',
  'yogur_griego_hacendado.jpg',
  'alternative',
  2,
  ARRAY['Mismos ingredientes', 'Mayor contenido graso, más saciante']
FROM public.categories c WHERE c.slug = 'yogur-natural';

INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Tomate frito Hida (tomates recién cosechados)',
  'Hida',
  'Mercadona',
  'Tomate (138 g por 100 g), aceite de oliva virgen extra (5,1 %), azúcar y sal',
  'tomate_frito_hida.jpg',
  'primary',
  1,
  ARRAY['Ingredientes simples y reconocibles', 'Aceite de oliva virgen extra como única grasa', 'Sin aditivos ni espesantes', 'Receta tradicional']
FROM public.categories c WHERE c.slug = 'tomate-frito';

INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Tomate frito receta artesana Hacendado',
  'Hacendado',
  'Mercadona',
  'Tomate, aceite de oliva (5 %), azúcar y sal',
  'tomate_frito_receta_artesana_hacendado.jpg',
  'alternative',
  2,
  ARRAY['Ingredientes claros y sin aditivos', 'Aceite de oliva como grasa principal', 'Muy similar a la opción principal']
FROM public.categories c WHERE c.slug = 'tomate-frito';

INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Pastas de aceite Hacendado',
  'Hacendado',
  'Mercadona',
  'Harina de trigo, azúcar, aceite de oliva virgen extra (22 %), levadura, matalahúga, almendras y canela',
  'pastas_de_aceite_hacendado.jpg',
  'primary',
  1,
  ARRAY['Aceite de oliva virgen extra como única grasa', 'Ingredientes tradicionales y reconocibles', 'Sin aceites de semillas', 'Menos ultraprocesadas que la mayoría']
FROM public.categories c WHERE c.slug = 'galletas-simples';

INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Galletas de mantequilla Hacendado',
  'Hacendado',
  'Mercadona',
  'Harina de trigo, azúcar, mantequilla, huevos y sal',
  'galletas_mantequilla_hacendado.jpg',
  'alternative',
  2,
  ARRAY['Mantequilla como grasa principal', 'Ingredientes clásicos', 'Aceptables dentro de la categoría']
FROM public.categories c WHERE c.slug = 'galletas-simples';

INSERT INTO public.products (category_id, name_exact, brand, supermarket, ingredients, image_key, role, rank, why_recommended)
SELECT 
  c.id,
  'Huevos camperos Hacendado',
  'Hacendado',
  'Mercadona',
  'Huevos camperos',
  'huevos_camperos_hacendado.jpg',
  'primary',
  1,
  ARRAY['Producto sin procesar', 'Gallinas camperas (código 1)', 'Mejor opción que huevos de jaula', 'Elección simple con impacto']
FROM public.categories c WHERE c.slug = 'huevos';