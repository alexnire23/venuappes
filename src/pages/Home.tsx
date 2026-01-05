import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera, PenLine, ShoppingCart, LogOut, Loader2, Crown } from 'lucide-react';

export default function Home() {
  const { user, profile, loading, signOut } = useAuth();
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

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const remainingUses = profile?.free_uses_remaining ?? 0;
  const isPaid = profile?.is_paid ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-foreground">Compra Real</h1>
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
              Mercadona (MVP)
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Status Badge */}
        <div className="mb-8 animate-fade-in">
          {isPaid ? (
            <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 w-fit mx-auto">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">Acceso ilimitado</span>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 text-center">
              <p className="text-sm text-muted-foreground">Usos gratis restantes</p>
              <p className="text-3xl font-serif font-bold text-foreground mt-1">
                {remainingUses}
              </p>
              {remainingUses === 0 && (
                <Button
                  variant="soft"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/paywall')}
                >
                  Desbloquear por 4,99 €
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-4 animate-slide-up">
            <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-6">
              ¿Qué tienes en tu lista?
            </h2>

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
              <div>
                <span className="block text-lg">Subir foto de tu lista</span>
                <span className="block text-sm opacity-80 font-normal">
                  La analizamos por ti
                </span>
              </div>
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Write List Button */}
            <Button
              variant="outline"
              size="xl"
              className="w-full"
              onClick={() => navigate('/write')}
            >
              <PenLine className="h-5 w-5 mr-2" />
              Escribir lista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
