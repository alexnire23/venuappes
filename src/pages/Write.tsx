import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Write() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Por favor, escribe tu lista');
      return;
    }

    setIsProcessing(true);

    // Parse text into items
    const items = text
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) {
      toast.error('No se encontraron items en tu lista');
      setIsProcessing(false);
      return;
    }

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    navigate('/confirm', {
      state: {
        inputType: 'text',
        items,
        rawInput: text,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif font-bold text-foreground">Escribir lista</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-6">
        <div className="flex-1 flex flex-col animate-fade-in">
          <p className="text-muted-foreground mb-4">
            Escribe o pega tu lista. Un producto por línea.
          </p>

          <div className="flex-1 mb-6">
            <Textarea
              placeholder="Ejemplo:&#10;patatas fritas&#10;yogur natural&#10;tomate frito&#10;galletas&#10;huevos"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-full min-h-[200px] resize-none rounded-xl text-base"
            />
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
