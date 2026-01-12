import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Infinity } from 'lucide-react';

export function FreeUsesIndicator() {
  const { profile, loading } = useAuth();

  if (loading || !profile) return null;

  // Don't show for paid users (they have unlimited)
  if (profile.is_paid) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full">
        <Infinity className="h-3.5 w-3.5" />
        <span className="font-medium">Acceso ilimitado</span>
      </div>
    );
  }

  const remaining = profile.free_uses_remaining;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
      <Sparkles className="h-3.5 w-3.5" />
      <span className="font-medium">
        {remaining} {remaining === 1 ? 'uso gratis' : 'usos gratis'}
      </span>
    </div>
  );
}