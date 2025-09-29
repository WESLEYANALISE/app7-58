import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, X, Monitor, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExplainThisPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (imageData: string) => void;
}

interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const ExplainThisPartModal = ({ isOpen, onClose, onImageSelected }: ExplainThisPartModalProps) => {
  const [currentStep, setCurrentStep] = useState<'capture' | 'select'>('capture');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionArea | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempSelection, setTempSelection] = useState<SelectionArea | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { captureScreen, isCapturing, capturedImage, clearCapture } = useScreenCapture();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const activeImage = capturedImage || uploadedImage;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('capture');
      setUploadedImage(null);
      setSelection(null);
      setIsDrawing(false);
      setTempSelection(null);
      clearCapture();
    }
  }, [isOpen, clearCapture]);

  // Move to selection step when image is available
  useEffect(() => {
    if (activeImage && currentStep === 'capture') {
      setCurrentStep('select');
    }
  }, [activeImage, currentStep]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(event);
    setIsDrawing(true);
    setTempSelection({
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !tempSelection) return;

    const coords = getCanvasCoordinates(event);
    setTempSelection({
      ...tempSelection,
      endX: coords.x,
      endY: coords.y
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tempSelection) return;
    
    setIsDrawing(false);
    setSelection(tempSelection);
  };

  // Draw selection rectangle on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !activeImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw selection rectangle
    const currentSelection = tempSelection || selection;
    if (currentSelection) {
      const { startX, startY, endX, endY } = currentSelection;
      
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear selected area
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(
        Math.min(startX, endX),
        Math.min(startY, endY),
        Math.abs(endX - startX),
        Math.abs(endY - startY)
      );
      
      // Draw selection border
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        Math.min(startX, endX),
        Math.min(startY, endY),
        Math.abs(endX - startX),
        Math.abs(endY - startY)
      );
    }
  }, [activeImage, selection, tempSelection]);

  const handleConfirmSelection = () => {
    if (!selection || !activeImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    
    if (!ctx || !image) return;

    const { startX, startY, endX, endY } = selection;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    canvas.width = width;
    canvas.height = height;

    // Draw cropped image
    ctx.drawImage(
      image,
      x, y, width, height,  // Source rectangle
      0, 0, width, height   // Destination rectangle
    );

    const croppedImageData = canvas.toDataURL('image/png');
    onImageSelected(croppedImageData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Explicar esta parte
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'capture' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {isMobile 
                  ? "Envie uma captura de tela da sua galeria para que a Professora IA possa analisar."
                  : "Capture sua tela para que a Professora IA possa analisar a parte selecionada."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isMobile && (
                <Button
                  onClick={captureScreen}
                  disabled={isCapturing}
                  className="h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Monitor className="w-8 h-8" />
                  {isCapturing ? 'Capturando...' : 'Capturar Tela'}
                </Button>
              )}

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="h-20 flex-col gap-2"
                variant="outline"
              >
                <Upload className="w-8 h-8" />
                {isMobile ? 'Enviar da Galeria' : 'Enviar Imagem'}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {currentStep === 'select' && activeImage && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Arraste para selecionar a área que deseja explicar
              </p>
            </div>

            <div className="relative border rounded-lg overflow-hidden bg-gray-50">
              <img
                ref={imageRef}
                src={activeImage}
                alt="Captured content"
                className="max-w-full h-auto opacity-0"
                onLoad={() => {
                  const canvas = canvasRef.current;
                  const img = imageRef.current;
                  if (canvas && img) {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                  }
                }}
              />
              
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('capture')}
              >
                Voltar
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelection(null)}
                  disabled={!selection}
                >
                  Limpar Seleção
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  disabled={!selection}
                  className="bg-primary hover:bg-primary/90"
                >
                  Explicar Esta Parte
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};