import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { Button } from '@/components/ui/button';
import { FreeUsesIndicator } from '@/components/FreeUsesIndicator';
import { Camera, PenLine, ShoppingCart, LogOut, Loader2, Search } from 'lucide-react';

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
      <header className="px-7 py-5 flex flex-col gap-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-lg font-bold text-foreground">Compra Real</h1>
          </div>
          {ENABLE_AUTH && user && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
        {ENABLE_AUTH && user && <FreeUsesIndicator />}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-7 py-10">
        {/* Upload Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-5 animate-slide-up">
            <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-1 leading-tight">
              Sube tu lista de la compra
            </h2>
            <p className="text-center text-muted-foreground text-sm mb-8">
              Te decimos qué producto comprar
            </p>

            {/* Upload Photo Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full h-auto py-10 flex-col gap-4"
              onClick={() => navigate('/upload')}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <Camera className="h-8 w-8" />
              </div>
              <span className="text-lg font-semibold">Subir foto de mi lista</span>
            </Button>

            {/* Spacer */}
            <div className="pt-2" />

            {/* Secondary Actions */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate('/write')}
              >
                <PenLine className="h-4 w-4 mr-2.5 opacity-70" />
                Escribir lista manualmente
              </Button>

              <div className="mx-auto w-12 h-px bg-border/60" />

              <Button
                variant="ghost"
                size="lg"
                className="w-full text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate('/search')}
              >
                <Search className="h-4 w-4 mr-2.5 opacity-70" />
                Buscar producto
              </Button>
            </div>
          </div>
        </div>

        {/* Mercadona Badge */}
        <div className="text-center pt-6">
          <span className="text-[11px] text-muted-foreground/60 tracking-wide uppercase">
            Mercadona (MVP)
          </span>
        </div>
      </div>
    </div>
  );
}
