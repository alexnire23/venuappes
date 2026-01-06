import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Por favor, introduce un email válido');
const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

export default function Auth() {
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    // Try to sign in first
    const { error: signInError } = await signInWithEmail(email, password);
    
    if (signInError) {
      // If invalid credentials, try to sign up
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await signUpWithEmail(email, password);
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            toast.error('Contraseña incorrecta.');
          } else {
            toast.error('Error al crear la cuenta. Inténtalo de nuevo.');
          }
          setIsSubmitting(false);
          return;
        }
        toast.success('¡Cuenta creada!');
      } else {
        toast.error('Error al iniciar sesión. Inténtalo de nuevo.');
        setIsSubmitting(false);
        return;
      }
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Error al conectar con Google. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-hero safe-top safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
              <ShoppingCart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Compra Real
            </h1>
          </div>

          {/* Info Text */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              Crea tu cuenta para guardar tus recomendaciones.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              3 usos gratis · Sin compromiso.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 space-y-4">
              {/* Email */}
              <div>
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-border bg-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
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
                  Entrando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </Button>
        </div>
      </div>
    </div>
  );
}
