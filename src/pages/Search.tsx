import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ImageLightbox } from '@/components/ImageLightbox';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { FreeUsesIndicator } from '@/components/FreeUsesIndicator';

interface Product {
  id: string;
  name_exact: string;
  brand: string;
  category_id: string;
  ingredients: string | null;
  image_key: string | null;
  role: string;
  why_recommended: string[];
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

interface CategoryResult {
  categoryName: string;
  categorySlug: string;
  primary: Product | null;
  alternative: Product | null;
}

// Same keyword mapping as Results
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'patatas-fritas': ['patatas', 'patata', 'fritas', 'chips', 'snacks', 'patatas fritas'],
  'yogur-natural': ['yogur', 'yogures', 'yogurt', 'yoghurt', 'natural', 'yogur natural'],
  'tomate-frito': ['tomate frito', 'tomates frito', 'tomate', 'frito'],
  'galletas-simples': ['galletas', 'galleta', 'pastas', 'cookies', 'bizcocho'],
  'huevos': ['huevos', 'huevo', 'huevos camperos'],
  'avena': ['avena', 'copos de avena', 'oats', 'porridge', 'copos'],
  'cereales': ['cereales', 'cereal', 'corn flakes', 'cornflakes'],
  'mostaza-antigua': ['mostaza antigua', 'mostaza', 'antigua'],
  'mostaza-dijon': ['mostaza dijon', 'mostaza', 'dijon'],
  'salsa-tomate': ['salsa de tomate', 'salsa tomate', 'tomate albahaca', 'salsa', 'salsas', 'tomate', 'datterino'],
  'helados': ['helado', 'helados', 'polo', 'polos', 'ice cream', 'granizado'],
  'pan-de-molde': ['pan de molde', 'pan molde', 'pan'],
};

const SUGGESTION_CHIPS = [
  { label: 'Yogures', query: 'yogur' },
  { label: 'Tomate frito', query: 'tomate frito' },
  { label: 'Patatas fritas', query: 'patatas fritas' },
  { label: 'Galletas', query: 'galletas' },
  { label: 'Cereales', query: 'cereales' },
  { label: 'Avena', query: 'avena' },
  { label: 'Salsas', query: 'salsa' },
  { label: 'Pan de molde', query: 'pan de molde' },
  { label: 'Helados', query: 'helados' },
];

const getImageSrc = (imageKey: string) =>
  imageKey.startsWith('http') ? imageKey : `/products/${imageKey}`;

export default function SearchPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const isDemo = ENABLE_AUTH && !user;
  const supermarket = localStorage.getItem('selectedSupermarket') ?? 'Mercadona';
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').eq('active', true).order('order'),
        supabase.from('products').select('*').eq('active', true).eq('supermarket', supermarket),
      ]);
      setCategories(catRes.data ?? []);
      setProducts(prodRes.data ?? []);
      setLoaded(true);
    };
    fetchData();
  }, []);

  const findAllMatches = (q: string): (CategoryResult & { score: number })[] => {
    if (!q.trim() || !loaded) return [];

    const normalized = q.toLowerCase().trim();
    const results: (CategoryResult & { score: number })[] = [];

    for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let bestScore = 0;
      for (const kw of keywords) {
        if (normalized === kw) {
          bestScore = Math.max(bestScore, 3);
        } else if (kw.includes(normalized)) {
          bestScore = Math.max(bestScore, 2);
        } else if (normalized.includes(kw)) {
          bestScore = Math.max(bestScore, 1);
        }
      }
      if (bestScore > 0) {
        const cat = categories.find(c => c.slug === slug);
        const catProducts = products.filter(p => cat && p.category_id === cat.id);
        results.push({
          categoryName: cat?.name ?? '',
          categorySlug: slug,
          primary: catProducts.find(p => p.role === 'primary') || null,
          alternative: catProducts.find(p => p.role === 'alternative') || null,
          score: bestScore,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  };

  const doSearch = async (q: string) => {
    if (ENABLE_AUTH && !user) {
      navigate('/auth');
      return;
    }

    if (ENABLE_AUTH && user) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('free_uses_remaining, is_paid')
        .eq('id', user.id)
        .single();

      if (currentProfile) {
        if (!currentProfile.is_paid && currentProfile.free_uses_remaining <= 0) {
          navigate('/paywall', { replace: true });
          return;
        }

        if (!currentProfile.is_paid) {
          const { error: decrementError } = await supabase
            .from('profiles')
            .update({ free_uses_remaining: currentProfile.free_uses_remaining - 1 })
            .eq('id', user.id);

          if (decrementError) {
            console.error('Error decrementing:', decrementError);
          }

          await refreshProfile();
        }
      }
    }

    setSearchedQuery(q);
    setHasSearched(true);
    setExpandedCards(new Set());
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    doSearch(query);
  };

  const results = hasSearched ? findAllMatches(searchedQuery) : [];

  const showSuggestions = !hasSearched && !query.trim();
  const showEmpty = hasSearched && results.length === 0 && loaded;

  const toggleCard = (slug: string) => {
    const next = new Set(expandedCards);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setExpandedCards(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-8 py-5 flex items-center gap-3 border-b border-border/30">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-lg font-semibold text-foreground">Buscar producto</h1>
      </header>
      {ENABLE_AUTH && user && <div className="px-6 pt-3"><FreeUsesIndicator /></div>}
      {/* Search bar */}
      <div className="px-6 sm:px-8 pt-8 pb-3 space-y-5">
        <p className="text-base text-muted-foreground leading-relaxed">
          Escribe una categoría o producto y te diremos qué comprar.
        </p>
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && handleSearch()}
            placeholder="Buscar…"
            className="pl-12 h-14 rounded-2xl bg-card border-border/30 text-base px-5"
            autoFocus
          />
        </div>

        {isDemo && hasSearched ? (
          <button
            onClick={() => navigate('/auth')}
            className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
          >
            Crear cuenta para seguir →
          </button>
        ) : (
          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            variant="hero"
            size="xl"
            className="w-full"
          >
            Ver recomendación
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2.5 animate-fade-in">
            {SUGGESTION_CHIPS.map(chip => (
              <button
                key={chip.query}
                onClick={() => {
                  setQuery(chip.query);
                  doSearch(chip.query);
                }}
                className="px-4 py-2.5 rounded-full text-[15px] text-muted-foreground bg-card border border-border/30 hover:border-primary/20 hover:text-foreground transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="text-center py-24 animate-fade-in">
            <p className="text-base text-muted-foreground">
              Todavía no tenemos recomendaciones para esa búsqueda.
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            {results.map((result, index) => (
              <div
                key={result.categorySlug}
                className="bg-card rounded-2xl border border-border/30 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.08}s`, boxShadow: 'var(--shadow-md)' }}
              >
                {/* No acceptable product */}
                {!result.primary && (
                  <div className="p-7">
                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-4">
                      {result.categoryName}
                    </p>
                    <div className="bg-secondary/50 rounded-xl p-5">
                      <p className="text-[15px] text-muted-foreground leading-relaxed">
                        En esta categoría no hay ahora mismo una opción claramente buena. Preferimos no recomendar antes que hacerlo mal.
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary Product */}
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
                            onError={e => {
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

                    {/* Alternative */}
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
                                  onError={e => {
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
          </div>
        )}
      </div>

      <ImageLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        open={!!lightboxSrc}
        onOpenChange={(open) => { if (!open) setLightboxSrc(null); }}
      />
    </div>
  );
}
