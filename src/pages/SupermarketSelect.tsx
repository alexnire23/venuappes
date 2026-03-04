import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="flex-1 flex flex-col items-center px-5 pt-16 pb-10">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up w-full max-w-xs">
          <h1 className="text-[2rem] text-foreground mb-2 leading-tight">
            ¿Dónde haces la compra?
          </h1>
          <p className="text-sm text-muted-foreground">
            Compra sin pensar.
          </p>
        </div>

        {/* Supermarket cards */}
        <div className="w-full max-w-xs space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {supermarkets.map((s) => {
            const isSelected = s.available && selected === s.name;
            return (
              <button
                key={s.name}
                disabled={!s.available}
                onClick={() => s.available && setSelected(s.name)}
                className={`w-full rounded-2xl flex items-center justify-between px-5 py-4 transition-all duration-150 ${
                  !s.available
                    ? 'border border-border bg-card opacity-50 cursor-default'
                    : isSelected
                    ? 'border-2 border-primary bg-[#F0F5F2]'
                    : 'border border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary' : 'border border-border bg-background'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className={`text-[15px] font-medium ${s.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.name}
                  </span>
                </div>

                {!s.available && (
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    Próximamente
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <div className="w-full max-w-xs animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={handleContinue}
            className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full transition-opacity hover:opacity-85"
          >
            Continuar con {selected}
          </button>
        </div>
      </div>
    </div>
  );
}
