import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
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
    if (ENABLE_AUTH && (!user || profile === null)) return;
    processItems();
  }, [state, user, profile, hasProcessed]);

  const processItems = async () => {
    if (!state?.items || hasProcessed) return;

    setHasProcessed(true);
    setIsLoading(true);

    if (ENABLE_AUTH && profile) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: accessData, error: accessError } = await supabase.functions.invoke(
          'decrement-free-use',
          {
            method: 'POST',
            headers: session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : undefined,
          }
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

  if (ENABLE_AUTH && !user) {
    return <Navigate to="/auth" state={{ from: '/results' }} replace />;
  }

  if (!state && !sessionStorage.getItem('confirmState')) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-5 py-5 text-center border-b border-border">
        <h1 className="text-lg text-foreground">Tu compra</h1>
        {!isLoading && results.length > 0 && (
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.1em] uppercase text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="text-[8px]">●</span>
              {supermarket}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 animate-fade-in">
            <Loader2 className="h-7 w-7 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-[15px]">Analizando tu lista...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Results */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={result.categorySlug}
                  className="bg-card rounded-2xl border border-border overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 0.06}s`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  {!result.primary && (
                    <div className="p-5">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {result.categoryName}
                      </p>
                      <p className="text-[14px] text-muted-foreground leading-relaxed">
                        No hay ningún producto aceptable en {supermarket} en esta categoría.
                      </p>
                    </div>
                  )}

                  {result.primary && (
                    <div className="p-5">
                      {/* Category label */}
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {result.categoryName}
                      </p>

                      {/* Primary product */}
                      <div className="flex gap-4 mb-5">
                        {result.primary.image_key && (
                          <button
                            onClick={() => {
                              setLightboxSrc(getImageSrc(result.primary!.image_key!));
                              setLightboxAlt(result.primary!.name_exact);
                            }}
                            className="w-20 h-20 rounded-xl bg-background overflow-hidden shrink-0 cursor-zoom-in border border-border/50"
                          >
                            <img
                              src={getImageSrc(result.primary.image_key!)}
                              alt={result.primary.name_exact}
                              className="w-full h-full object-contain p-1.5"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                              }}
                            />
                          </button>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[16px] font-semibold text-foreground mb-1.5 leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {result.primary.name_exact}
                          </h3>
                          <span className="inline-block text-[10px] font-semibold text-white bg-primary px-2.5 py-0.5 rounded-full uppercase tracking-[0.08em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Recomendado
                          </span>
                        </div>
                      </div>

                      {/* Reasons */}
                      <ul className="space-y-2">
                        {result.primary.why_recommended.slice(0, 3).map((reason, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[13px] text-foreground leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <span className="text-accent font-semibold mt-0.5 shrink-0">✓</span>
                            {reason}
                          </li>
                        ))}
                      </ul>

                      {/* Alternative */}
                      {result.alternative && (
                        <div className="mt-5 pt-4 border-t border-border">
                          <button
                            onClick={() => toggleCard(result.categorySlug)}
                            className="w-full flex items-center justify-between text-[13px] text-accent font-medium transition-opacity hover:opacity-70"
                            style={{ fontFamily: 'Inter, sans-serif' }}
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
                                <button
                                  onClick={() => {
                                    setLightboxSrc(getImageSrc(result.alternative!.image_key!));
                                    setLightboxAlt(result.alternative!.name_exact);
                                  }}
                                  className="w-16 h-16 rounded-xl bg-background overflow-hidden shrink-0 cursor-zoom-in border border-border/50"
                                >
                                  <img
                                    src={getImageSrc(result.alternative.image_key!)}
                                    alt={result.alternative.name_exact}
                                    className="w-full h-full object-contain p-1"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </button>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-semibold text-foreground mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {result.alternative.name_exact}
                                </p>
                                <ul className="space-y-1.5">
                                  {result.alternative.why_recommended.slice(0, 2).map((reason, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[13px] text-foreground leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      <span className="text-accent font-semibold mt-0.5 shrink-0">✓</span>
                                      {reason}
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
            </div>

            {/* Unmatched Items */}
            {unmatchedItems.length > 0 && (
              <div className="mt-3 bg-card rounded-2xl p-5 border border-border">
                <p className="text-[14px] font-semibold text-foreground mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Aún no lo cubrimos
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {unmatchedItems.join(', ')}
                </p>
              </div>
            )}

            {/* Closing block */}
            {results.length > 0 && (
              <div className="mt-6 bg-[#F0F5F2] rounded-2xl p-6 text-center">
                <p className="text-[18px] text-foreground leading-snug">
                  Estos productos están seleccionados por ingredientes, no por precio ni marketing.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && (
        <div className="px-5 py-5 border-t border-border bg-background">
          <button
            onClick={() => navigate('/home')}
            className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
          >
            <RotateCcw className="h-4 w-4" />
            Nueva lista →
          </button>
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
