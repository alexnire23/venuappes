import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface LocationState {
  inputType: 'image' | 'text';
  items: string[];
  rawInput: string;
}

export default function Confirm() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (state?.items) {
      setItems(state.items);
    }
  }, [state]);

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

  if (!state) {
    return <Navigate to="/home" replace />;
  }

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (items.length === 0) {
      toast.error('Añade al menos un producto');
      return;
    }

    const isPaid = profile?.is_paid ?? false;
    const remainingUses = profile?.free_uses_remaining ?? 0;

    // Check if user can generate
    if (!isPaid && remainingUses <= 0) {
      navigate('/paywall');
      return;
    }

    setIsGenerating(true);

    // Navigate to results with the items
    navigate('/results', {
      state: {
        inputType: state.inputType,
        items,
        rawInput: state.rawInput,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif font-bold text-foreground">Confirmar lista</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-6">
        <div className="flex-1 animate-fade-in">
          <p className="text-muted-foreground mb-4">
            Revisa los productos detectados. Puedes añadir o eliminar items.
          </p>

          {/* Items List */}
          <div className="space-y-2 mb-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-sm border border-border/50"
              >
                <span className="flex-1 text-foreground">{item}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Item */}
          <div className="flex gap-2 mb-8">
            <Input
              placeholder="Añadir producto..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1 h-11 rounded-xl"
            />
            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={handleAddItem}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating || items.length === 0}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generar recomendaciones
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
