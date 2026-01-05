import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Loader2, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  searchTerm: string;
}

// Keywords mapping for categories
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'patatas-fritas': ['patatas', 'patata', 'fritas', 'chips', 'snacks'],
  'yogur-natural': ['yogur', 'yogures', 'yogurt', 'yoghurt', 'natural'],
  'tomate-frito': ['tomate', 'tomates', 'frito', 'salsa'],
  'galletas-simples': ['galletas', 'galleta', 'pastas', 'cookies', 'bizcocho'],
  'huevos': ['huevos', 'huevo', 'huevos camperos'],
};

export default function Results() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [results, setResults] = useState<CategoryResult[]>([]);
  const [unmatchedItems, setUnmatchedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state?.items && user) {
      processItems();
    }
  }, [state, user]);

  const processItems = async () => {
    if (!state?.items) return;

    setIsLoading(true);

    try {
      // Check if user can use
      const isPaid = profile?.is_paid ?? false;
      const remainingUses = profile?.free_uses_remaining ?? 0;

      if (!isPaid && remainingUses <= 0) {
        navigate('/paywall');
        return;
      }

      // Fetch all categories and products
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

      // Match items to categories
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
                searchTerm: item,
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

      // Decrement uses if not paid
      if (!isPaid && remainingUses > 0) {
        await supabase
          .from('profiles')
          .update({ free_uses_remaining: remainingUses - 1 })
          .eq('id', user!.id);
        
        await refreshProfile();
      }

      // Record scan
      await supabase.from('scans').insert({
        user_id: user!.id,
        input_type: state.inputType,
        raw_input: state.rawInput,
        categories_matched: matched.map(m => m.categorySlug),
      });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!state) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
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
            {/* Results */}
            {results.map((result, index) => (
              <div
                key={result.categorySlug}
                className="bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Category Header */}
                <div className="bg-primary/5 px-4 py-3 border-b border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Buscaste: {result.searchTerm}
                  </p>
                  <h3 className="font-serif font-bold text-foreground">
                    {result.categoryName}
                  </h3>
                </div>

                {/* Primary Product */}
                {result.primary && (
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image Placeholder */}
                      <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <span className="text-3xl">🛒</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                          </span>
                          <span className="text-xs font-medium text-primary uppercase">
                            Recomendado
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm leading-tight mb-2">
                          {result.primary.name_exact}
                        </h4>
                        <ul className="space-y-1">
                          {result.primary.why_recommended.slice(0, 3).map((reason, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Alternative Toggle */}
                    {result.alternative && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <button
                          onClick={() => toggleCard(result.categorySlug)}
                          className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span>Ver alternativa</span>
                          {expandedCards.has(result.categorySlug) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {expandedCards.has(result.categorySlug) && (
                          <div className="mt-4 flex gap-3 animate-fade-in">
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <span className="text-xl">🔄</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                Alternativa
                              </p>
                              <h5 className="font-medium text-foreground text-sm mb-1">
                                {result.alternative.name_exact}
                              </h5>
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
            Nueva lista
          </Button>
        </div>
      )}
    </div>
  );
}
