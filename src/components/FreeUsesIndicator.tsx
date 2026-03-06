import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function FreeUsesIndicator() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading || !profile || profile.is_paid) return null;

  const remaining = profile.free_uses_remaining;

  if (remaining <= 0) {
    return (
      <button
        onClick={() => navigate('/paywall')}
        className="text-xs text-destructive font-medium px-3 py-1.5 rounded-full border border-destructive/30 hover:bg-destructive/5 transition-colors"
      >
        Sin usos restantes · Desbloquea →
      </button>
    );
  }

  return (
    <div className="text-xs text-muted-foreground/60 px-3 py-1.5">
      ✦ {remaining} {remaining === 1 ? 'uso gratis' : 'usos gratis'}
    </div>
  );
}
