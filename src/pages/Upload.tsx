import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Image, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

    await new Promise(resolve => setTimeout(resolve, 1500));

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
      <header className="px-7 py-5 flex items-center gap-3 border-b border-border/40">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-lg font-bold text-foreground">Subir foto</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-7 py-7">
        {selectedImage ? (
          <div className="flex-1 flex flex-col animate-fade-in">
            {/* Preview */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-muted/50 mb-7">
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

            <div className="w-full max-w-sm space-y-5">
              <p className="text-center text-muted-foreground text-sm mb-10 leading-relaxed">
                Haz una foto de tu lista (papel, notas o impresa)
              </p>

              {/* Camera Button */}
              <Button
                variant="hero"
                size="xl"
                className="w-full h-auto py-7"
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
