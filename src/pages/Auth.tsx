import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Por favor, introduce un email válido');
const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

export default function Auth() {
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: string })?.from || '/home';

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
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

    const { error: signInError } = await signInWithEmail(email, password);

    if (signInError) {
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
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      <div className="flex-1 flex flex-col px-5 pt-16 pb-8">

        {/* Headline */}
        <div className="mb-10 animate-fade-in">
          <h1 className="font-serif text-[2rem] text-foreground leading-tight mb-2">
            Cesta
          </h1>
          <p className="text-muted-foreground text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Entra para ver tus recomendaciones.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-5 animate-slide-up" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-border bg-background text-[14px]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-11 rounded-xl border-border bg-background text-[14px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50 mt-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Un momento...</>
              ) : (
                'Continuar'
              )}
            </button>
          </form>
        </div>

        <p className="text-[13px] text-muted-foreground text-center mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
          Si ya tienes cuenta, entra. Si no, la creamos.
        </p>

      </div>
    </div>
  );
}
