import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').eq('active', true).order('order'),
        supabase.from('products').select('*').eq('active', true),
      ]);
      setCategories(catRes.data ?? []);
      setProducts(prodRes.data ?? []);
      setLoaded(true);
    };
    fetchData();
  }, []);

  const findAllMatches = (q: string): CategoryResult[] => {
    if (!q.trim() || !loaded) return [];
    const normalized = q.toLowerCase().trim();
    type ScoredResult = CategoryResult & { score: number };
    const results: ScoredResult[] = [];

    for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let bestScore = 0;
      for (const kw of keywords) {
        if (normalized === kw) bestScore = Math.max(bestScore, 3);
        else if (kw.includes(normalized)) bestScore = Math.max(bestScore, 2);
        else if (normalized.includes(kw)) bestScore = Math.max(bestScore, 1);
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

  const handleSearch = () => {
    setSearchedQuery(query);
    setHasSearched(true);
    setExpandedCards(new Set());
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
      <header className="px-8 py-5 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-lg font-bold text-foreground">Buscar producto</h1>
      </header>

      {/* Search bar */}
      <div className="px-8 pb-2 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Escribe una categoría o producto y te diremos qué comprar.
        </p>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && handleSearch()}
            placeholder="Buscar…"
            className="pl-11 h-13 rounded-lg bg-card border-border/40 text-base"
            autoFocus
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="w-full"
          size="lg"
        >
          Ver recomendación
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {SUGGESTION_CHIPS.map(chip => (
              <button
                key={chip.query}
                onClick={() => {
                  setQuery(chip.query);
                  setSearchedQuery(chip.query);
                  setHasSearched(true);
                  setExpandedCards(new Set());
                }}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground border border-border/50 hover:border-foreground/20 hover:text-foreground transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Todavía no tenemos recomendaciones para esa búsqueda.
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {results.map((result, index) => (
              <div
                key={result.categorySlug}
                className="bg-card rounded-xl overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.08}s`, boxShadow: 'var(--shadow-md)' }}
              >
                {!result.primary && (
                  <div className="p-6">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                      {result.categoryName}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      En esta categoría no hay una opción claramente buena.
                    </p>
                  </div>
                )}

                {result.primary && (
                  <div>
                    <div className="px-6 pt-6 flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {result.categoryName}
                      </p>
                      <span className="text-[9px] font-bold text-primary uppercase tracking-[0.15em] border border-primary/25 px-2 py-0.5 rounded">
                        Recomendado
                      </span>
                    </div>

                    {result.primary.image_key && (
                      <div className="mt-4 mx-6 aspect-[3/2] rounded-lg bg-muted/30 overflow-hidden">
                        <img
                          src={`/products/${result.primary.image_key}`}
                          alt={result.primary.name_exact}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="px-6 pt-5 pb-6">
                      <h3 className="font-serif text-2xl font-bold text-foreground mb-5 leading-tight">
                        {result.primary.name_exact}
                      </h3>

                      <div className="space-y-2.5">
                        {result.primary.why_recommended.slice(0, 3).map((reason, i) => (
                          <p key={i} className="text-[13px] text-muted-foreground leading-relaxed">
                            — {reason}
                          </p>
                        ))}
                      </div>

                      {result.alternative && (
                        <div className="mt-6 pt-5 border-t border-border/50">
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
                            <div className="mt-4 flex gap-4 animate-fade-in">
                              {result.alternative.image_key && (
                                <div className="w-20 h-20 rounded-lg bg-muted/30 overflow-hidden shrink-0">
                                  <img
                                    src={`/products/${result.alternative.image_key}`}
                                    alt={result.alternative.name_exact}
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                      (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm mb-2">
                                  {result.alternative.name_exact}
                                </p>
                                <div className="space-y-1">
                                  {result.alternative.why_recommended.slice(0, 2).map((reason, i) => (
                                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                                      — {reason}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
