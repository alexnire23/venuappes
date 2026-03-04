import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

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
      <div className="w-full max-w-xs flex flex-col items-center text-center animate-fade-in">
        <CheckCircle
          className="mb-8"
          style={{ width: 48, height: 48, color: '#1C3A2F' }}
        />
        <h1
          className="font-serif text-foreground leading-tight mb-4"
          style={{ fontSize: 28 }}
        >
          Ya tienes acceso.
        </h1>
        <p
          className="text-[15px] mb-10"
          style={{ fontFamily: 'Inter, sans-serif', color: '#6B6B6B' }}
        >
          Consulta todos los productos que quieras, cuando quieras.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="w-full h-14 text-white text-[15px] font-medium rounded-full flex items-center justify-center transition-opacity hover:opacity-85"
          style={{ backgroundColor: '#1C3A2F', fontFamily: 'Inter, sans-serif' }}
        >
          Hacer mi primera compra →
        </button>
      </div>
    </div>
  );
}
