import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FreeUsesIndicator } from '@/components/FreeUsesIndicator';
import { ENABLE_AUTH } from '@/config/flags';
import { useAuth } from '@/contexts/AuthContext';

export default function Write() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Por favor, escribe tu lista');
      return;
    }

    setIsProcessing(true);

    const items = text
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) {
      toast.error('No se encontraron items en tu lista');
      setIsProcessing(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    navigate('/confirm', {
      state: {
        inputType: 'text',
        items,
        rawInput: text,
      },
    });
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-5 py-5 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate('/home')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-[17px] font-medium text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Tu lista</h1>
        <div className="ml-auto">{ENABLE_AUTH && user && <FreeUsesIndicator />}</div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 py-6">
        <div className="flex-1 flex flex-col animate-fade-in">
          <p className="text-[13px] text-muted-foreground mb-4">
            Un producto por línea, o separados por comas.
          </p>

          <div className="flex-1 mb-6">
            <Textarea
              placeholder="patatas fritas, yogur, galletas..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-full min-h-[220px] resize-none rounded-xl text-[15px] bg-card border-border p-4 placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isProcessing || !hasText}
            className={`w-full h-14 rounded-full text-[15px] font-medium flex items-center justify-center gap-2 transition-opacity ${
              hasText
                ? 'bg-primary text-white hover:opacity-85'
                : 'bg-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Continuar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
