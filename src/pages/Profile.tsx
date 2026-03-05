import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-5 py-5 flex items-center gap-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-lg text-foreground">Perfil</h1>
      </header>

      <div className="flex-1 px-5 py-8 flex flex-col gap-6">
        {/* Info card */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Email
            </p>
            <p className="text-[15px] text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
              {user?.email ?? '—'}
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Estado
            </p>
            {profile?.is_paid ? (
              <p className="text-[15px] text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                Acceso ilimitado ✓
              </p>
            ) : (
              <p className="text-[15px] text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                {profile?.free_uses_remaining ?? 0} usos gratis restantes
              </p>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-full border border-border text-[15px] text-muted-foreground transition-opacity hover:opacity-70"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
