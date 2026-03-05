import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function Payment() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const startCheckout = async () => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { user_id: user.id },
      });

      if (error || !data?.url) {
        console.error('Checkout error:', error);
        setError(true);
        return;
      }

      window.location.href = data.url;
    };

    startCheckout();
  }, [loading, user]);

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 safe-top safe-bottom">
        <div className="w-full max-w-xs text-center">
          <p className="text-foreground text-[15px] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Algo ha salido mal. Vuelve atrás e inténtalo de nuevo.
          </p>
          <button
            onClick={() => navigate('/paywall')}
            className="text-primary text-[15px] underline underline-offset-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 safe-top safe-bottom">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Preparando el pago...
        </p>
      </div>
    </div>
  );
}
