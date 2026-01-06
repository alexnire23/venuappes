import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';

export default function Paywall() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

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

  // If already paid, redirect to home
  if (profile?.is_paid) {
    return <Navigate to="/home" replace />;
  }

  const benefits = [
    'Recomendaciones directas de productos',
    'Sin leer etiquetas ni comparar',
    'Pago único',
  ];

  const handlePayment = () => {
    navigate('/payment');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-4">
        {/* Hero */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Acceso ilimitado
          </h1>
          <p className="text-muted-foreground">
            Compra sin pensar siempre que hagas la compra.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price and CTA */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-6">
            <span className="font-serif text-4xl font-bold text-foreground">4,99 €</span>
            <span className="text-muted-foreground ml-2">· pago único</span>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full mb-4"
            onClick={handlePayment}
          >
            Continuar por 4,99 €
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Sin suscripciones · Sin pagos recurrentes
          </p>
        </div>
      </div>
    </div>
  );
}
