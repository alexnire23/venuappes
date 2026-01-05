import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Por favor, introduce un email válido');

export default function Auth() {
  const { user, loading, signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await signInWithOtp(email);
    
    if (error) {
      toast.error('Error al enviar el enlace. Inténtalo de nuevo.');
      setIsSubmitting(false);
      return;
    }
    
    setEmailSent(true);
    setIsSubmitting(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col gradient-hero safe-top safe-bottom">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-scale-in">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                ¡Revisa tu email!
              </h1>
              <p className="text-muted-foreground">
                Te hemos enviado un enlace mágico a
              </p>
              <p className="font-medium text-foreground mt-1">{email}</p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 mb-6">
              <p className="text-sm text-muted-foreground text-center">
                Haz clic en el enlace del email para acceder a tu cuenta. El enlace caduca en 1 hora.
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Usar otro email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gradient-hero safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
              <ShoppingCart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Compra Real
            </h1>
            <p className="text-muted-foreground mt-2">
              Compra sin pensar
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50">
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-border bg-background"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar enlace mágico'
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Te enviaremos un enlace para acceder sin contraseña
          </p>
        </div>
      </div>
    </div>
  );
}
