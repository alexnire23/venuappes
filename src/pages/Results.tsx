import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

// Keywords mapping for categories
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

export default function Results() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationState = location.state as LocationState | null;
  const [state, setState] = useState<LocationState | null>(locationState);

  const [results, setResults] = useState<CategoryResult[]>([]);
  const [unmatchedItems, setUnmatchedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [hasProcessed, setHasProcessed] = useState(false);

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
        .eq('active', true);

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
      <header className="px-4 py-4 flex items-center gap-3 border-b border-border/50">
        <h1 className="font-serif font-bold text-foreground">Recomendaciones</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analizando tu lista...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Global Header */}
            {results.length > 0 && (
              <div className="text-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                  Compra esto en Mercadona
                </h2>
                <p className="text-sm text-muted-foreground">
                  Basado en ingredientes simples y poco procesados.
                </p>
              </div>
            )}

            {/* Results */}
            {results.map((result, index) => (
              <div
                key={result.categorySlug}
                className="bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {!result.primary && (
                  <div className="p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                      {result.categoryName}
                    </p>
                    <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                      <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        No hay ningún producto aceptable en Mercadona
                      </p>
                    </div>
                  </div>
                )}

                {result.primary && (
                  <div className="p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                      {result.categoryName}
                    </p>

                    {result.primary.image_key && (
                      <div className="w-full aspect-[4/3] rounded-xl bg-muted mb-4 overflow-hidden">
                        <img
                          src={`/products/${result.primary.image_key}`}
                          alt={result.primary.name_exact}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <h3 className="font-serif text-xl font-bold text-foreground mb-2 leading-tight">
                      {result.primary.name_exact}
                    </h3>

                    <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full mb-3 uppercase tracking-wide">
                      Recomendado
                    </span>

                    <ul className="space-y-1.5">
                      {result.primary.why_recommended.slice(0, 3).map((reason, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>

                    {result.alternative && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <button
                          onClick={() => toggleCard(result.categorySlug)}
                          className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span>Ver alternativa (opcional)</span>
                          {expandedCards.has(result.categorySlug) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {expandedCards.has(result.categorySlug) && (
                          <div className="mt-4 flex gap-3 animate-fade-in">
                            {result.alternative.image_key && (
                              <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                                <img
                                  src={`/products/${result.alternative.image_key}`}
                                  alt={result.alternative.name_exact}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm mb-1">
                                {result.alternative.name_exact}
                              </p>
                              <ul className="space-y-0.5">
                                {result.alternative.why_recommended.slice(0, 2).map((reason, i) => (
                                  <li key={i} className="text-xs text-muted-foreground">
                                    • {reason}
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
              <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">
                      Aún no lo cubrimos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {unmatchedItems.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.length === 0 && unmatchedItems.length > 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif font-bold text-foreground mb-2">
                  Sin coincidencias
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  No encontramos productos en nuestras categorías actuales
                </p>
              </div>
            )}

            {/* Closing phrase */}
            {results.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Compra estos productos y no pienses más.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && (
        <div className="px-6 py-4 border-t border-border/50 bg-background">
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
    </div>
  );
}
