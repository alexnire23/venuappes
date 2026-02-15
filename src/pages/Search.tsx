import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

// Same keyword mapping as Results
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'patatas-fritas': ['patatas', 'patata', 'fritas', 'chips', 'snacks'],
  'yogur-natural': ['yogur', 'yogures', 'yogurt', 'yoghurt', 'natural'],
  'tomate-frito': ['tomate frito', 'tomates frito', 'tomate'],
  'galletas-simples': ['galletas', 'galleta', 'pastas', 'cookies', 'bizcocho'],
  'huevos': ['huevos', 'huevo', 'huevos camperos'],
  'avena': ['avena', 'copos de avena', 'oats', 'porridge'],
  'cereales': ['cereales', 'cereal', 'corn flakes', 'cornflakes'],
  'mostaza-antigua': ['mostaza antigua'],
  'mostaza-dijon': ['mostaza dijon', 'dijon'],
  'salsa-tomate': ['salsa de tomate', 'salsa tomate', 'tomate albahaca', 'salsa'],
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
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

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

  const matchedResults = useMemo((): CategoryResult[] => {
    if (!query.trim() || !loaded) return [];

    const q = query.toLowerCase().trim();
    const matched: CategoryResult[] = [];
    const matchedSlugs = new Set<string>();

    // Sort keywords by length descending so longer/more-specific matches win first
    const entries = Object.entries(CATEGORY_KEYWORDS).sort(
      (a, b) => Math.max(...b[1].map(k => k.length)) - Math.max(...a[1].map(k => k.length))
    );

    for (const [slug, keywords] of entries) {
      if (matchedSlugs.has(slug)) continue;
      if (keywords.some(kw => q.includes(kw) || kw.includes(q))) {
        matchedSlugs.add(slug);
        const cat = categories.find(c => c.slug === slug);
        const catProducts = products.filter(p => cat && p.category_id === cat.id);
        matched.push({
          categoryName: cat?.name ?? '',
          categorySlug: slug,
          primary: catProducts.find(p => p.role === 'primary') || null,
          alternative: catProducts.find(p => p.role === 'alternative') || null,
        });
      }
    }

    return matched;
  }, [query, categories, products, loaded]);

  const showSuggestions = !query.trim();
  const showEmpty = query.trim().length > 0 && matchedResults.length === 0 && loaded;

  const toggleCard = (slug: string) => {
    const next = new Set(expandedCards);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setExpandedCards(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif font-bold text-foreground">Buscar producto</h1>
      </header>

      {/* Search bar + subtitle */}
      <div className="px-6 pt-6 pb-2 space-y-3">
        <p className="text-sm text-muted-foreground">
          Escribe una categoría o producto (ej: yogur, tomate frito, patatas fritas…) y te diremos qué comprar.
        </p>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="pl-10"
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {SUGGESTION_CHIPS.map(chip => (
              <button
                key={chip.query}
                onClick={() => setQuery(chip.query)}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Todavía no tenemos recomendaciones para esa categoría.
            </p>
          </div>
        )}

        {/* Results — same card format as Results.tsx */}
        {matchedResults.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {matchedResults.map((result, index) => (
              <div
                key={result.categorySlug}
                className="bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* No acceptable product */}
                {!result.primary && (
                  <div className="p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                      {result.categoryName}
                    </p>
                    <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                      <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        En esta categoría no hay ahora mismo una opción claramente buena. Preferimos no recomendar antes que hacerlo mal.
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary Product */}
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
                          onError={e => {
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

                    {/* Alternative */}
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
                                  onError={e => {
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
          </div>
        )}
      </div>
    </div>
  );
}
