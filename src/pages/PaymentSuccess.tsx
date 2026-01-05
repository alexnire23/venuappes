import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>

        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          ¡Acceso desbloqueado!
        </h1>
        <p className="text-muted-foreground mb-8">
          Ya tienes acceso ilimitado a Compra Real. Gracias por tu apoyo.
        </p>

        <Button
          variant="hero"
          size="xl"
          className="w-full"
          onClick={() => navigate('/home')}
        >
          Empezar a usar
        </Button>
      </div>
    </div>
  );
}
