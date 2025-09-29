import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, RotateCcw, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      // Verificar se o navegador suporta mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador');
      }

      // Tentar diferentes configurações para compatibilidade mobile/iframe
      const constraints = [
        // Configuração ideal
        {
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        // Configuração simplificada para iframe/mobile
        {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        // Configuração mínima
        {
          video: {
            facingMode: facingMode
          }
        },
        // Fallback básico
        {
          video: true
        }
      ];

      let stream = null;
      let lastError = null;

      // Tentar cada configuração até uma funcionar
      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (err) {
          lastError = err;
          console.warn('Tentativa de câmera falhou:', err);
        }
      }

      if (!stream) {
        throw lastError || new Error('Não foi possível acessar a câmera');
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      let errorMessage = "Não foi possível acessar a câmera.";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Acesso à câmera negado. Por favor, permita o acesso nas configurações do seu navegador.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "Nenhuma câmera encontrada neste dispositivo.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Câmera não suportada neste navegador.";
      } else if (window.self !== window.top) {
        errorMessage = "Para usar a câmera, abra o app diretamente no navegador (fora do iframe).";
      }
      
      toast({
        title: "Erro na câmera",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [facingMode, toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const takePicture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePicture = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      // Converter data URL para File
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        });
    }
  }, [capturedImage, onCapture, onClose]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(startCamera, 100);
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-background/95 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tirar Foto</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            {!capturedImage ? (
              <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button onClick={startCamera} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Ativar Câmera
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="flex gap-2 mt-4">
            {!capturedImage ? (
              <>
                {isStreaming && (
                  <>
                    <Button
                      variant="outline"
                      onClick={switchCamera}
                      className="flex-1 gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Virar
                    </Button>
                    <Button
                      onClick={takePicture}
                      className="flex-1 gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Capturar
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={retakePicture}
                  className="flex-1 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Tirar Novamente
                </Button>
                <Button
                  onClick={confirmCapture}
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Usar Foto
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};