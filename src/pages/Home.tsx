import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { Button } from '@/components/ui/button';
import { FreeUsesIndicator } from '@/components/FreeUsesIndicator';
import { Camera, ShoppingCart, LogOut, Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (ENABLE_AUTH && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between">
        <button onClick={() => navigate('/select')} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <span className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors">Compra Real</span>
        </button>
        {ENABLE_AUTH && user && (
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </header>
      {ENABLE_AUTH && user && (
        <div className="px-8"><FreeUsesIndicator /></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 pt-12 pb-8">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-sm animate-slide-up">
            <h2 className="font-serif text-[2rem] font-bold text-foreground text-center mb-3 leading-tight tracking-tight">
              Sube tu lista de la compra
            </h2>
            <p className="text-center text-muted-foreground text-base mb-14">
              Te decimos qué producto comprar.
            </p>

            {/* Upload Photo Button — dominant */}
            <Button
              variant="hero"
              size="xl"
              className="w-full h-16 text-base mb-10"
              onClick={() => navigate('/upload')}
            >
              <Camera className="h-5 w-5 mr-2" />
              Subir foto de mi lista
            </Button>

            {/* Secondary Actions — editorial with arrow */}
            <div className="space-y-5">
              <button
                onClick={() => navigate('/write')}
                className="w-full flex items-center justify-between text-[17px] text-foreground/70 hover:text-foreground transition-colors group py-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-border">—</span>
                  <span>Escribir lista manualmente</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate('/search')}
                className="w-full flex items-center justify-between text-[17px] text-foreground/70 hover:text-foreground transition-colors group py-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-border">—</span>
                  <span>Buscar producto</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Mercadona Badge */}
        <div className="text-center pt-8">
          <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">
            Solo Mercadona por ahora
          </span>
        </div>
      </div>
    </div>
  );
}
