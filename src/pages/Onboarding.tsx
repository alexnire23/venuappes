import { useNavigate } from 'react-router-dom';
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
      <div className="flex-1 flex flex-col items-center px-5 pt-16 pb-10">
        {/* App name */}
        <p className="font-serif text-[20px] text-foreground mb-14 animate-fade-in">Cesta</p>

        {/* Hero Text */}
        <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-[2.5rem] text-foreground mb-4 leading-tight">
            Compra sin pensar.
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            Te decimos exactamente qué meter en el carrito.
          </p>
        </div>

        {/* Bullets */}
        <div className="w-full max-w-xs space-y-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {bullets.map((bullet, index) => (
            <p key={index} className="text-[15px] text-muted-foreground text-center leading-relaxed">
              {bullet}
            </p>
          ))}
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <div className="w-full max-w-xs animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => navigate('/home')}
            className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full transition-opacity hover:opacity-85"
          >
            Empezar
          </button>

          <p className="text-center text-[12px] text-muted-foreground/50 mt-5">
            Mercadona y Carrefour
          </p>

          {ENABLE_AUTH && (
            <p className="text-center text-[13px] text-muted-foreground mt-2">
              3 usos gratis · Pago único de 4,99 €
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
