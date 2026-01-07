import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LocationState {
  inputType: 'image' | 'text';
  items: string[];
  rawInput: string;
}

export default function Confirm() {
  const { user, profile, loading } = useAuth();
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

    // Store state for after auth (in case user needs to login)
    const confirmState = {
      inputType: state.inputType,
      items,
      rawInput: state.rawInput,
    };
    sessionStorage.setItem('confirmState', JSON.stringify(confirmState));

    // If user is not logged in, redirect to auth first
    if (!user) {
      navigate('/auth', { 
        state: { from: '/results' },
        replace: false 
      });
      return;
    }

    // User is logged in - go directly to results
    // The access check (paid/free uses) happens in /results AFTER showing results at least once
    setIsGenerating(true);

    navigate('/results', {
      state: confirmState,
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
            Hemos detectado estos productos. Ajusta solo si falta algo.
          </p>

          {/* Items as Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-card rounded-full pl-4 pr-2 py-2 shadow-sm border border-border/50"
              >
                <span className="text-foreground text-sm">{item}</span>
                <button
                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => handleRemoveItem(index)}
                >
                  <X className="h-3 w-3" />
                </button>
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
            'Ver qué comprar'
          )}
        </Button>
      </div>
    </div>
  );
}
