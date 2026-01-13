import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Payment() {
  const { user, profile, loading, refreshProfile } = useAuth();
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

  if (profile?.is_paid) {
    return <Navigate to="/payment-success" replace />;
  }

  // Stripe integration placeholder - payment must be processed securely via webhook
  // The simulate payment button has been removed as it was a security vulnerability
  // Real payments will be processed through Stripe webhooks that update is_paid server-side

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
          <CreditCard className="h-10 w-10 text-primary-foreground" />
        </div>

        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          Procesando pago
        </h1>
        <p className="text-muted-foreground mb-8">
          Stripe Checkout se abrirá próximamente
        </p>

        <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 mb-6">
          <p className="text-sm text-muted-foreground">
            La integración con Stripe está en desarrollo. Pronto podrás pagar de forma segura.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => navigate('/paywall')}
        >
          Volver
        </Button>
      </div>
    </div>
  );
}
