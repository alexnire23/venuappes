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

  // Temporary: simulate payment for demo
  const handleSimulatePayment = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ is_paid: true })
        .eq('id', user.id);
      
      await refreshProfile();
      toast.success('¡Pago completado!');
      navigate('/payment-success');
    } catch (error) {
      toast.error('Error al procesar el pago');
    }
  };

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
          <p className="text-sm text-muted-foreground mb-4">
            La integración con Stripe está pendiente. Por ahora, puedes simular el pago para probar la app.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleSimulatePayment}
          >
            Simular pago (Demo)
          </Button>
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
