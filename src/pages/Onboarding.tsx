import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles, Shield, Zap, Loader2 } from 'lucide-react';

export default function Onboarding() {
  const { user, loading } = useAuth();
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

  const features = [
    {
      icon: Sparkles,
      title: 'Productos verificados',
      description: 'Recomendaciones basadas en ingredientes reales',
    },
    {
      icon: Shield,
      title: 'Sin ultraprocesados',
      description: 'Solo productos con ingredientes que reconoces',
    },
    {
      icon: Zap,
      title: 'Rápido y simple',
      description: 'Sube tu lista y obtén recomendaciones al instante',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col gradient-hero safe-top safe-bottom">
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <ShoppingCart className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3 leading-tight">
            Compra sin<br />pensar
          </h1>
          <p className="text-lg text-muted-foreground max-w-xs mx-auto">
            Sube tu lista de la compra y te decimos exactamente qué productos comprar
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-10">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 bg-card rounded-2xl p-4 shadow-sm border border-border/50 animate-slide-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button
            variant="hero"
            size="xl"
            className="w-full mb-4"
            onClick={() => navigate('/home')}
          >
            Empezar
          </Button>

          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">3 usos gratis.</span>{' '}
              Pago único de{' '}
              <span className="font-semibold text-primary">4,99 €</span>{' '}
              para desbloquear usos ilimitados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
