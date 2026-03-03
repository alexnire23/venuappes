import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const supermarkets = [
  { name: 'Mercadona', available: true },
  { name: 'Carrefour', available: true },
  { name: 'Lidl', available: false },
  { name: 'Alcampo', available: false },
];

export default function SupermarketSelect() {
  const navigate = useNavigate();
  const stored = localStorage.getItem('selectedSupermarket');
  const [selected, setSelected] = useState(stored ?? 'Mercadona');

  const handleContinue = () => {
    localStorage.setItem('selectedSupermarket', selected);
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center px-8 pt-20 pb-10">
        {/* Header */}
        <div className="text-center mb-14 animate-slide-up">
          <h1 className="font-serif text-[2.25rem] font-bold text-foreground mb-4 leading-[1.1] tracking-tight">
            ¿Dónde haces la compra?
          </h1>
          <p className="text-sm text-muted-foreground">
            Disponible en Mercadona y Carrefour.
          </p>
        </div>

        {/* Supermarket list */}
        <div className="w-full max-w-xs space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {supermarkets.map((s) => {
            const isSelected = s.available && selected === s.name;
            return (
              <button
                key={s.name}
                disabled={!s.available}
                onClick={() => s.available && setSelected(s.name)}
                className={`w-full rounded-2xl border px-5 py-4 flex items-center justify-between transition-all ${
                  !s.available
                    ? 'border-border bg-card opacity-45 cursor-default'
                    : isSelected
                    ? 'border-primary bg-primary/[0.06]'
                    : 'border-border/50 bg-card hover:border-primary/30 hover:bg-primary/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : s.available
                        ? 'bg-muted text-muted-foreground/40 border border-border'
                        : 'bg-muted text-muted-foreground/50'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                  <span className={`text-[15px] font-medium ${s.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.name}
                  </span>
                </div>

                {!s.available && (
                  <span className="text-xs text-muted-foreground/60 tracking-wide">
                    Próximamente
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <div className="w-full max-w-xs animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <Button
            variant="hero"
            size="xl"
            className="w-full h-16 text-lg"
            onClick={handleContinue}
          >
            Continuar con {selected}
          </Button>
        </div>
      </div>
    </div>
  );
}
