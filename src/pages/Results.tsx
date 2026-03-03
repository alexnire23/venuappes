import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageLightbox } from '@/components/ImageLightbox';

interface LocationState {
  inputType: 'image' | 'text';
  items: string[];
  rawInput: string;
}

interface Product {
  id: string;
  name_exact: string;
  brand: string;
  ingredients: string | null;
  image_key: string | null;
  role: string;
  why_recommended: string[];
}

interface CategoryResult {
  categoryName: string;
  categorySlug: string;
  matched: boolean;
  primary: Product | null;
  alternative: Product | null;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'patatas-fritas': ['patatas', 'patata', 'fritas', 'chips', 'snacks'],
  'yogur-natural': ['yogur', 'yogures', 'yogurt', 'yoghurt', 'natural'],
  'tomate-frito': ['tomate frito', 'tomates frito'],
  'galletas-simples': ['galletas', 'galleta', 'pastas', 'cookies', 'bizcocho'],
  'huevos': ['huevos', 'huevo', 'huevos camperos'],
  'avena': ['avena', 'copos de avena', 'oats', 'porridge'],
  'cereales': ['cereales', 'cereal', 'corn flakes', 'cornflakes'],
  'mostaza-antigua': ['mostaza antigua'],
  'mostaza-dijon': ['mostaza dijon', 'dijon'],
  'salsa-tomate': ['salsa de tomate', 'salsa tomate', 'tomate albahaca'],
  'helados': ['helado', 'helados', 'polo', 'polos', 'ice cream'],
  'pan-de-molde': ['pan de molde', 'pan molde'],
};

const getImageSrc = (imageKey: string) =>
  imageKey.startsWith('http') ? imageKey : `/products/${imageKey}`;

export default function Results() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const supermarket = localStorage.getItem('selectedSupermarket') ?? 'Mercadona';
  
  const locationState = location.state as LocationState | null;
  const [state, setState] = useState<LocationState | null>(locationState);

  const [results, setResults] = useState<CategoryResult[]>([]);
  const [unmatchedItems, setUnmatchedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [hasProcessed, setHasProcessed] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  // Recover state from sessionStorage if coming from auth
  useEffect(() => {
    if (!locationState) {
      const savedState = sessionStorage.getItem('confirmState');
      if (savedState) {
        setState(JSON.parse(savedState));
        sessionStorage.removeItem('confirmState');
      }
    }
  }, [locationState]);

  useEffect(() => {
    if (!state?.items || hasProcessed) return;
    // When auth is disabled, process immediately; when enabled, wait for user+profile
    if (ENABLE_AUTH && (!user || profile === null)) return;
    processItems();
  }, [state, user, profile, hasProcessed]);

  const processItems = async () => {
    if (!state?.items || hasProcessed) return;

    setHasProcessed(true);
    setIsLoading(true);

    // Access check only when auth is enabled
    if (ENABLE_AUTH && profile) {
      try {
        const { data: accessData, error: accessError } = await supabase.functions.invoke(
          'decrement-free-use',
          { method: 'POST' }
        );

        if (accessError) {
          console.error('Access check error:', accessError);
          toast.error('Error al verificar acceso');
          navigate('/home', { replace: true });
          return;
        }

        if (!accessData?.access_granted) {
          navigate('/paywall', { replace: true });
          return;
        }

        await refreshProfile();
      } catch (error) {
        console.error('Error checking access:', error);
        toast.error('Error al verificar acceso');
        navigate('/home', { replace: true });
        return;
      }
    }

    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('order');

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('supermarket', supermarket);

      if (!categories || !products) {
        throw new Error('Error loading data');
      }

      const matchedCategories = new Set<string>();
      const matched: CategoryResult[] = [];
      const unmatched: string[] = [];

      for (const item of state.items) {
        const itemLower = item.toLowerCase().trim();
        let found = false;

        for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
          if (keywords.some(kw => itemLower.includes(kw))) {
            if (!matchedCategories.has(slug)) {
              matchedCategories.add(slug);
              const category = categories.find(c => c.slug === slug);
              const categoryProducts = products.filter(p => 
                category && p.category_id === category.id
              );

              matched.push({
                categoryName: category?.name ?? '',
                categorySlug: slug,
                matched: true,
                primary: categoryProducts.find(p => p.role === 'primary') || null,
                alternative: categoryProducts.find(p => p.role === 'alternative') || null,
              });
            }
            found = true;
            break;
          }
        }

        if (!found) {
          unmatched.push(item);
        }
      }

      setResults(matched);
      setUnmatchedItems(unmatched);

      // Record scan only when auth is enabled and user exists
      if (ENABLE_AUTH && user) {
        await supabase.from('scans').insert({
          user_id: user.id,
          input_type: state.inputType,
          raw_input: state.rawInput,
          categories_matched: matched.map(m => m.categorySlug),
        });
      }

    } catch (error) {
      console.error('Error processing items:', error);
      toast.error('Error al procesar la lista');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCard = (slug: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug);
    } else {
      newExpanded.add(slug);
    }
    setExpandedCards(newExpanded);
  };

  if (ENABLE_AUTH && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in (only when auth is enabled)
  if (ENABLE_AUTH && !user) {
    return <Navigate to="/auth" state={{ from: '/results' }} replace />;
  }

  // If no state and no saved state, go to home
  if (!state && !sessionStorage.getItem('confirmState')) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-8 py-5 text-center border-b border-border/30">
        <h1 className="font-serif text-lg font-semibold text-foreground">Recomendaciones</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-5" />
            <p className="text-muted-foreground text-base">Analizando tu lista...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-fade-in">
            {/* Global Header */}
            {results.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-[1.75rem] font-bold text-foreground mb-3 leading-tight">
                  Compra esto en {supermarket}
                </h2>
                <p className="text-base text-muted-foreground">
                  Basado en ingredientes simples y poco procesados.
                </p>
              </div>
            )}

            {/* Results */}
            {results.map((result, index) => (
              <div
                key={result.categorySlug}
                className="bg-card rounded-2xl border border-border/30 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.08}s`, boxShadow: 'var(--shadow-md)' }}
              >
                {!result.primary && (
                  <div className="p-7">
                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-4">
                      {result.categoryName}
                    </p>
                    <div className="bg-secondary/50 rounded-xl p-5">
                      <p className="text-[15px] text-muted-foreground leading-relaxed">
                        No hay ningún producto aceptable en {supermarket} en esta categoría. Preferimos no recomendar antes que hacerlo mal.
                      </p>
                    </div>
                  </div>
                )}

                {result.primary && (
                  <div className="p-7">
                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-6">
                      {result.categoryName}
                    </p>

                    <div className="flex gap-5 mb-6">
                      {result.primary.image_key && (
                        <button
                          onClick={() => {
                            setLightboxSrc(getImageSrc(result.primary!.image_key!));
                            setLightboxAlt(result.primary!.name_exact);
                          }}
                          className="w-32 h-32 rounded-xl bg-secondary/30 overflow-hidden shrink-0 cursor-zoom-in active:scale-95 transition-transform"
                        >
                          <img
                            src={getImageSrc(result.primary.image_key!)}
                            alt={result.primary.name_exact}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                            }}
                          />
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2 leading-snug">
                          {result.primary.name_exact}
                        </h3>
                        <span className="inline-block text-[10px] font-bold text-primary border border-primary/30 px-2.5 py-0.5 rounded uppercase tracking-[0.12em]">
                          Recomendado
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3.5 pl-1">
                      {result.primary.why_recommended.slice(0, 3).map((reason, i) => (
                        <li key={i} className="text-[15px] text-muted-foreground flex items-start gap-3 leading-relaxed">
                          <span className="text-muted-foreground/30 mt-0.5">—</span>
                          {reason}
                        </li>
                      ))}
                    </ul>

                    {result.alternative && (
                      <div className="mt-7 pt-6 border-t border-border/30">
                        <button
                          onClick={() => toggleCard(result.categorySlug)}
                          className="w-full flex items-center justify-between text-[15px] text-muted-foreground/60 hover:text-foreground transition-colors"
                        >
                          <span>Ver alternativa (opcional)</span>
                          {expandedCards.has(result.categorySlug) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {expandedCards.has(result.categorySlug) && (
                          <div className="mt-5 flex gap-4 animate-fade-in">
                            {result.alternative.image_key && (
                              <button
                                onClick={() => {
                                  setLightboxSrc(getImageSrc(result.alternative!.image_key!));
                                  setLightboxAlt(result.alternative!.name_exact);
                                }}
                                className="w-20 h-20 rounded-lg bg-secondary/30 overflow-hidden shrink-0 cursor-zoom-in active:scale-95 transition-transform"
                              >
                                <img
                                  src={getImageSrc(result.alternative.image_key!)}
                                  alt={result.alternative.name_exact}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-base mb-2">
                                {result.alternative.name_exact}
                              </p>
                              <ul className="space-y-1.5">
                                {result.alternative.why_recommended.slice(0, 2).map((reason, i) => (
                                  <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                                    — {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Unmatched Items */}
            {unmatchedItems.length > 0 && (
              <div className="bg-secondary/30 rounded-2xl p-7 border border-border/30">
                <p className="font-medium text-foreground text-base mb-1">
                  Aún no lo cubrimos
                </p>
                <p className="text-sm text-muted-foreground">
                  {unmatchedItems.join(', ')}
                </p>
              </div>
            )}

            {/* Empty State */}
            {results.length === 0 && unmatchedItems.length > 0 && (
              <div className="text-center py-16">
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  Sin coincidencias
                </h3>
                <p className="text-base text-muted-foreground mb-6">
                  No encontramos productos en nuestras categorías actuales
                </p>
              </div>
            )}

            {/* Closing phrase */}
            {results.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/40 py-4 tracking-wide">
                Compra estos productos y no pienses más.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && (
        <div className="px-8 py-5 border-t border-border/30 bg-background">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate('/home')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Nueva lista de la compra
          </Button>
        </div>
      )}

      <ImageLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        open={!!lightboxSrc}
        onOpenChange={(open) => { if (!open) setLightboxSrc(null); }}
      />
    </div>
  );
}
