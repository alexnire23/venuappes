import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

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

  if (profile?.is_paid) {
    return <Navigate to="/home" replace />;
  }

  const benefits = [
    'Búsquedas ilimitadas, siempre que quieras',
    'Recomendaciones directas sin leer etiquetas',
    'Mercadona y Carrefour cubiertos',
    'Pago único, sin suscripción',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 pt-16 pb-8">

        {/* Headline */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-serif text-[28px] text-foreground leading-tight mb-2">
            Ya sabes cómo funciona.
          </h1>
          <p className="text-muted-foreground text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Acceso ilimitado por menos que un café.
          </p>
        </div>

        {/* Price card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-slide-up" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {/* Price */}
          <div className="mb-5">
            <span className="font-serif text-[42px] text-foreground leading-none">1,99€</span>
            <span className="text-muted-foreground text-[14px] ml-2" style={{ fontFamily: 'Inter, sans-serif' }}>· pago único</span>
          </div>

          {/* Benefits */}
          <ul className="space-y-3">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-primary font-semibold mt-0.5 shrink-0">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Guarantee */}
        <div className="flex items-center gap-3 px-1 mb-8 animate-fade-in">
          <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-[13px] text-muted-foreground leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sin suscripciones. Sin cargos ocultos. Pagas una vez y ya.
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="animate-slide-up">
          <button
            onClick={() => navigate('/payment')}
            className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2 mb-4 transition-opacity hover:opacity-85"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Acceder por 1,99€ →
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full text-center text-[14px] text-muted-foreground transition-opacity hover:opacity-70 py-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Ahora no
          </button>
        </div>

      </div>
    </div>
  );
}
