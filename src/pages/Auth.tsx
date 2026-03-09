import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Por favor, introduce un email válido');
const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

export default function Auth() {
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getDestination = () =>
    sessionStorage.getItem('confirmState') ? '/results' : '/home';

  useEffect(() => {
    if (user && !loading) {
      navigate(getDestination(), { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getDestination()} replace />;
  }

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
    setConfirmPassword('');
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    const { data: signUpData, error: signUpError } = await signUpWithEmail(email, password);

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        toast.error('Este email ya tiene cuenta. Inicia sesión.');
      } else {
        toast.error('Error al crear la cuenta. Inténtalo de nuevo.');
      }
      setIsSubmitting(false);
      return;
    }

    if (signUpData?.user && signUpData?.session) {
      toast.success('¡Cuenta creada!');
      navigate(getDestination(), { replace: true });
      return;
    }

    // Sin sesión inmediata — hacer login manual
    const { data: loginData, error: loginError } = await signInWithEmail(email, password);
    if (!loginError && loginData?.user) {
      toast.success('¡Cuenta creada!');
      navigate(getDestination(), { replace: true });
      return;
    }

    toast.error('Cuenta creada pero error al entrar. Inténtalo de nuevo.');
    setIsSubmitting(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      toast.error('Email o contraseña incorrectos.');
      setIsSubmitting(false);
      return;
    }
    if (data?.user) {
      navigate(getDestination(), { replace: true });
    }
  };

  // ── LOGIN ──────────────────────────────────────────────
  if (isLogin) {
    return (
      <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
        <div className="px-3 pt-4">
          <button onClick={() => navigate('/home')} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col px-5 pt-8 pb-8">
          <div className="mb-10 animate-fade-in">
            <h1 className="font-serif text-[2rem] text-foreground leading-tight mb-2">
              Iniciar sesión
            </h1>
            <p className="text-muted-foreground text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Entra para ver tus recomendaciones.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 mb-5 animate-slide-up" style={{ boxShadow: 'var(--shadow-md)' }}>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    className="pl-9 h-12 rounded-xl border-border bg-background text-[14px]"
                    required
                  />
                </div>
              </div>

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
                    className="pl-9 pr-9 h-12 rounded-xl border-border bg-background text-[14px]"
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
                className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50 mt-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Un momento...</>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>
          </div>

          <button
            onClick={handleToggleMode}
            className="text-[13px] text-primary font-medium text-center hover:text-primary/80 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ¿Eres nuevo? Crear cuenta →
          </button>
        </div>
      </div>
    );
  }

  // ── REGISTRO ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      <div className="px-3 pt-4">
        <button onClick={() => navigate('/home')} className="p-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col px-5 pt-8 pb-8">

        {/* Título */}
        <div className="mb-4 animate-fade-in">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-3 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver
            </button>
          )}
          <h1 className="font-serif text-[2rem] text-foreground leading-tight mb-2">
            {step === 1 ? '¿Cuál es tu email?' : 'Elige una contraseña'}
          </h1>
          {step === 1 ? (
            <p className="text-muted-foreground text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Te lo pedimos una sola vez.
            </p>
          ) : (
            <p className="text-muted-foreground text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {email}
            </p>
          )}
        </div>

        {/* Indicador de progreso */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>

        {/* Formulario */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-5 animate-slide-up" style={{ boxShadow: 'var(--shadow-md)' }}>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
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
                    className="pl-9 h-12 rounded-xl border-border bg-background text-[14px]"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-85 mt-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Continuar →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="pl-9 pr-9 h-12 rounded-xl border-border bg-background text-[14px]"
                    required
                    autoFocus
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

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 h-12 rounded-xl border-border bg-background text-[14px]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-primary text-white text-[15px] font-medium rounded-full flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50 mt-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Un momento...</>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>
          )}
        </div>

        <button
          onClick={handleToggleMode}
          className="text-[13px] text-muted-foreground text-center hover:text-foreground transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ¿Ya tienes cuenta? Iniciar sesión
        </button>

      </div>
    </div>
  );
}
