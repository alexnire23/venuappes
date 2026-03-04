import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ENABLE_AUTH } from '@/config/flags';
import { Input } from '@/components/ui/input';
import { FreeUsesIndicator } from '@/components/FreeUsesIndicator';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LocationState {
  inputType: 'image' | 'text';
  items: string[];
  rawInput: string;
}

export default function Confirm() {
  const { user, loading } = useAuth();
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

  if (ENABLE_AUTH && loading) {
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

    const confirmState = {
      inputType: state.inputType,
      items,
      rawInput: state.rawInput,
    };
    sessionStorage.setItem('confirmState', JSON.stringify(confirmState));

    if (ENABLE_AUTH && !user) {
      navigate('/auth', {
        state: { from: '/results' },
        replace: false,
      });
      return;
    }

    setIsGenerating(true);
    navigate('/results', { state: confirmState });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top safe-bottom">
      {/* Header */}
      <header className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-[17px] font-medium text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Esto he entendido</h1>
        </div>
        {ENABLE_AUTH && <FreeUsesIndicator />}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 py-6">
        <div className="flex-1 animate-fade-in">
          <p className="text-[13px] text-muted-foreground mb-5">
            Quita lo que no sea o añade algo más.
          </p>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-[#F0F5F2] border border-primary/20 rounded-full pl-3.5 pr-2 py-1.5"
              >
                <span className="text-foreground text-[14px]">{item}</span>
                <button
                  className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-border transition-colors"
                  onClick={() => handleRemoveItem(index)}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
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
              className="flex-1 h-11 rounded-xl bg-card border-border px-4 text-[15px]"
            />
            <button
              onClick={handleAddItem}
              className="w-11 h-11 shrink-0 rounded-xl bg-secondary flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <Plus className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || items.length === 0}
          className={`w-full h-14 rounded-full text-[15px] font-medium flex items-center justify-center gap-2 transition-opacity ${
            items.length > 0
              ? 'bg-primary text-white hover:opacity-85'
              : 'bg-border text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            'Ver qué comprar →'
          )}
        </button>
      </div>
    </div>
  );
}
