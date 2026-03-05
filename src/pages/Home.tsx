import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { FreeUsesIndicator } from '@/components/FreeUsesIndicator';
import { Camera, PenLine, Search, Store, ChevronDown, Loader2, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const supermarket = localStorage.getItem('selectedSupermarket') ?? 'Mercadona';

  if (ENABLE_AUTH && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ENABLE_AUTH && !loading && !user && localStorage.getItem('cesta_demo_used')) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-5 py-5 flex items-center justify-between">
        <span className="font-serif text-xl text-foreground">Cesta</span>
        <Button variant="ghost" size="icon" onClick={() => navigate(user ? '/profile' : '/auth')}>
          <User className="h-5 w-5" />
        </Button>
      </header>

      {ENABLE_AUTH && user && (
        <div className="px-5"><FreeUsesIndicator /></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 pt-10 pb-8">
        <div className="flex-1 flex flex-col">
          <div className="w-full animate-slide-up">
            <h2 className="text-[2rem] text-foreground mb-2 leading-tight">
              ¿Qué compras hoy?
            </h2>
            <p className="text-muted-foreground text-[15px] mb-5">
              Te decimos exactamente qué comprar.
            </p>

            {/* Supermarket chip */}
            <div className="flex mb-8">
              <button
                onClick={() => navigate('/select')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-primary bg-[#F0F5F2] transition-opacity hover:opacity-70"
                style={{ borderColor: '#1C3A2F' }}
              >
                <Store className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-medium text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {supermarket}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-primary" />
              </button>
            </div>

            {/* Upload Photo — primary CTA */}
            <button
              onClick={() => navigate('/upload')}
              className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2.5 mb-10 transition-opacity hover:opacity-85"
            >
              <Camera className="h-5 w-5" />
              Subir foto de mi lista
            </button>

            {/* Secondary actions */}
            <div className="divide-y divide-border">
              <button
                onClick={() => navigate('/write')}
                className="w-full flex items-center justify-between py-4 group transition-opacity hover:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <PenLine className="h-[18px] w-[18px] text-muted-foreground" />
                  <span className="text-[15px] text-foreground">Escribir lista manualmente</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => navigate('/search')}
                className="w-full flex items-center justify-between py-4 group transition-opacity hover:opacity-70"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-[18px] w-[18px] text-muted-foreground" />
                  <span className="text-[15px] text-foreground">Buscar producto</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
