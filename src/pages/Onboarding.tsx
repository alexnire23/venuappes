import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { ENABLE_AUTH } from '@/config/flags';

export default function Onboarding() {
  const navigate = useNavigate();

  const bullets = [
    'Productos concretos, sin comparar',
    'Basado en ingredientes simples',
    'Sin leer etiquetas',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center px-8 pt-16 pb-10">
        {/* Icon — small and discrete */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-14 animate-fade-in">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>

        {/* Hero Text — large editorial */}
        <div className="text-center mb-14 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-serif text-[2.5rem] font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
            Compra sin pensar
          </h1>
          <p className="text-base text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            Sube tu lista y te decimos exactamente qué producto comprar en Mercadona.
          </p>
        </div>

        {/* Bullets — editorial lines, no boxes */}
        <div className="w-full max-w-xs space-y-5 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {bullets.map((bullet, index) => (
            <p
              key={index}
              className="text-[15px] text-muted-foreground text-center leading-relaxed"
            >
              {bullet}
            </p>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="w-full max-w-xs animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            variant="hero"
            size="xl"
            className="w-full h-16 text-lg"
            onClick={() => navigate('/home')}
          >
            Empezar
          </Button>

          <p className="text-center text-xs text-muted-foreground/50 mt-5 tracking-wide">
            Solo Mercadona por ahora
          </p>

          {ENABLE_AUTH && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              3 usos gratis · Pago único de 4,99 €
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
