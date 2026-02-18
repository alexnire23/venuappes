import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { Button } from '@/components/ui/button';
import { FreeUsesIndicator } from '@/components/FreeUsesIndicator';
import { Camera, LogOut, Loader2, ArrowRight } from 'lucide-react';

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
      {/* Header — minimal */}
      <header className="px-8 py-5 flex items-center justify-between">
        <h1 className="font-serif text-lg font-bold text-foreground">Compra Real</h1>
        {ENABLE_AUTH && user && (
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </header>
      {ENABLE_AUTH && user && (
        <div className="px-8">
          <FreeUsesIndicator />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 pt-12 pb-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm animate-slide-up">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2 leading-tight">
              Sube tu lista
            </h2>
            <p className="text-muted-foreground text-sm mb-10">
              Te decimos qué producto comprar.
            </p>

            {/* Primary CTA — premium block */}
            <Button
              variant="hero"
              size="xl"
              className="w-full h-auto py-8 flex-col gap-3 mb-10"
              onClick={() => navigate('/upload')}
            >
              <Camera className="h-7 w-7" />
              <span className="text-base font-semibold">Subir foto de mi lista</span>
            </Button>

            {/* Secondary actions — editorial text links */}
            <div className="space-y-5">
              <button
                onClick={() => navigate('/write')}
                className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>Escribir manualmente</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="w-full h-px bg-border" />

              <button
                onClick={() => navigate('/search')}
                className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>Buscar producto</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Mercadona Badge */}
        <div className="text-center pt-8">
          <span className="text-[10px] text-muted-foreground/50 tracking-widest uppercase">
            Mercadona · MVP
          </span>
        </div>
      </div>
    </div>
  );
}
