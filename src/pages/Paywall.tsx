import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Sparkles, Infinity, Shield, Loader2 } from 'lucide-react';

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
    {
      icon: Infinity,
      title: 'Usos ilimitados',
      description: 'Sin límites en análisis de listas',
    },
    {
      icon: Sparkles,
      title: 'Nuevas categorías',
      description: 'Acceso a categorías futuras sin coste extra',
    },
    {
      icon: Shield,
      title: 'Pago único',
      description: 'Sin suscripciones ni pagos recurrentes',
    },
  ];

  const handlePayment = () => {
    // Navigate to Stripe checkout - will be implemented when Stripe is enabled
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
          <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-gentle">
            <span className="text-4xl">👑</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Desbloquea todo
          </h1>
          <p className="text-muted-foreground">
            Has agotado tus usos gratis
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="flex items-start gap-4 bg-card rounded-2xl p-4 shadow-sm border border-border/50 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <benefit.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price and CTA */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-card rounded-2xl p-6 shadow-md border border-primary/20 mb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground line-through">9,99 €</span>
              <span className="font-serif text-4xl font-bold text-foreground">4,99 €</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Pago único • Para siempre
            </p>
          </div>

          <Button
            variant="accent"
            size="xl"
            className="w-full mb-4"
            onClick={handlePayment}
          >
            Desbloquear ahora
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Pago seguro con Stripe. Satisfacción garantizada.
          </p>
        </div>
      </div>
    </div>
  );
}
