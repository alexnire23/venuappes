import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { ENABLE_AUTH } from '@/config/flags';

export default function Onboarding() {
  const navigate = useNavigate();

  const bullets = [
    'Productos concretos, sin comparar',
    'Basado en ingredientes simples',
    'Sin leer etiquetas',
  ];

  return (
    <div className="min-h-screen flex flex-col gradient-hero safe-top safe-bottom">
      <div className="flex-1 flex flex-col px-7 py-10">
        {/* Header */}
        <div className="flex items-center justify-center mb-12 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <ShoppingCart className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-5 leading-tight">
            Compra sin pensar
          </h1>
          <p className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Sube tu lista y te decimos exactamente qué producto comprar en Mercadona.
          </p>
        </div>

        {/* Bullets */}
        <div className="space-y-3.5 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {bullets.map((bullet, index) => (
            <div
              key={index}
              className="flex items-center gap-3.5 bg-card/50 rounded-xl p-4 border border-border/30"
            >
              <div className="w-6 h-6 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-foreground text-[15px]">{bullet}</span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            variant="hero"
            size="xl"
            className="w-full mb-4"
            onClick={() => navigate('/home')}
          >
            Empezar
          </Button>

          {ENABLE_AUTH && (
            <p className="text-center text-sm text-muted-foreground">
              3 usos gratis · Pago único de 4,99 €
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
