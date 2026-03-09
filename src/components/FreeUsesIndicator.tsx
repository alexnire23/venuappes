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
        className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full transition-colors"
      >
        Sin usos · Desbloquea acceso ilimitado →
      </button>
    );
  }

  if (remaining === 1) {
    return (
      <button
        onClick={() => navigate('/paywall')}
        className="text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors"
      >
        ✦ 1 uso gratis restante · Desbloquea →
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/paywall')}
      className="text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/70 px-3 py-1.5 rounded-full transition-colors"
    >
      ✦ {remaining} usos gratis
    </button>
  );
}
