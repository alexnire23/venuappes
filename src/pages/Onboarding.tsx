import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ENABLE_AUTH } from '@/config/flags';
import { ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      <div className="flex-1 flex flex-col justify-center px-8 py-16">
        {/* Editorial hero */}
        <div className="animate-fade-in">
          <h1 className="font-serif text-[2.75rem] font-bold text-foreground leading-[1.1] mb-6 text-balance">
            Compra sin pensar.
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-sm">
            Te decimos exactamente qué producto comprar en Mercadona.
            Sin comparar. Sin leer etiquetas.
          </p>

          {/* Editorial lines — no boxes, no checks */}
          <div className="space-y-4 mb-16 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <p className="text-sm text-foreground/70">— Productos concretos, sin comparar</p>
            <p className="text-sm text-foreground/70">— Basado en ingredientes simples</p>
            <p className="text-sm text-foreground/70">— Sin leer etiquetas</p>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={() => navigate('/home')}
          >
            Empezar
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          {ENABLE_AUTH && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              3 usos gratis · Pago único de 4,99 €
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
