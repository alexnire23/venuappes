import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera, PenLine, ShoppingCart, LogOut, Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
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
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-serif font-bold text-foreground">Compra Real</h1>
        </div>
        {user && (
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Upload Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-4 animate-slide-up">
            <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-2">
              Sube tu lista de la compra
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Te decimos qué producto comprar
            </p>

            {/* Upload Photo Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full h-auto py-8 flex-col gap-3"
              onClick={() => navigate('/upload')}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <Camera className="h-8 w-8" />
              </div>
              <span className="text-lg">Subir foto de mi lista</span>
            </Button>

            {/* Write List Button */}
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground"
              onClick={() => navigate('/write')}
            >
              <PenLine className="h-5 w-5 mr-2" />
              Escribir lista manualmente
            </Button>
          </div>
        </div>

        {/* Mercadona Badge */}
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            Mercadona (MVP)
          </span>
        </div>
      </div>
    </div>
  );
}
