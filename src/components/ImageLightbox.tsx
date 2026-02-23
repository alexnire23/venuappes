import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({ src, alt = '', open, onOpenChange }: ImageLightboxProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-background/95 backdrop-blur-sm border-border/20 rounded-2xl flex items-center justify-center">
        <VisuallyHidden>
          <DialogTitle>{alt || 'Imagen del producto'}</DialogTitle>
        </VisuallyHidden>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain rounded-xl"
        />
      </DialogContent>
    </Dialog>
  );
}
