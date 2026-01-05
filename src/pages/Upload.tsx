import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Image, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Upload() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecciona una imagen');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    // Simulate OCR processing - in real app, this would call an edge function
    // For MVP, we'll extract mock data and navigate to confirm
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Navigate to confirm with mock extracted items
    navigate('/confirm', {
      state: {
        inputType: 'image',
        items: ['Patatas fritas', 'Yogur', 'Tomate frito', 'Galletas', 'Huevos'],
        rawInput: 'Imagen subida',
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
        <h1 className="font-serif font-bold text-foreground">Subir foto</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-6">
        {selectedImage ? (
          <div className="flex-1 flex flex-col animate-fade-in">
            {/* Preview */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-muted mb-6">
              <img
                src={selectedImage}
                alt="Lista de la compra"
                className="w-full h-full object-contain"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-3 right-3"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Process Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analizando imagen...
                </>
              ) : (
                'Analizar lista'
              )}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-full max-w-sm space-y-4">
              <p className="text-center text-muted-foreground mb-8">
                Haz una foto de tu lista de la compra escrita a mano o impresa
              </p>

              {/* Camera Button */}
              <Button
                variant="hero"
                size="xl"
                className="w-full h-auto py-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 mr-3" />
                Hacer foto
              </Button>

              {/* Gallery Button */}
              <Button
                variant="outline"
                size="xl"
                className="w-full"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                    fileInputRef.current.setAttribute('capture', 'environment');
                  }
                }}
              >
                <Image className="h-5 w-5 mr-2" />
                Seleccionar de galería
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
