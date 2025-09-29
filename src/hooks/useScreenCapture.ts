import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseScreenCaptureResult {
  isCapturing: boolean;
  capturedImage: string | null;
  captureScreen: () => Promise<void>;
  clearCapture: () => void;
  error: string | null;
}

export const useScreenCapture = (): UseScreenCaptureResult => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const captureScreen = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('Screen capture not supported in this browser');
      toast({
        title: "Recurso não disponível",
        description: "Captura de tela não é suportada neste navegador. Use a opção de galeria.",
        variant: "destructive"
      });
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(video, 0, 0);

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64
      const dataURL = canvas.toDataURL('image/png');
      setCapturedImage(dataURL);

      toast({
        title: "Captura realizada!",
        description: "Agora selecione a área que deseja explicar."
      });

    } catch (err) {
      console.error('Screen capture failed:', err);
      const message = err instanceof Error ? err.message : 'Erro ao capturar tela';
      setError(message);
      
      if (message.includes('Permission denied') || message.includes('NotAllowedError')) {
        toast({
          title: "Permissão negada",
          description: "Você precisa permitir o compartilhamento de tela para usar este recurso.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro na captura",
          description: "Não foi possível capturar a tela. Tente usar a opção de galeria.",
          variant: "destructive"
        });
      }
    } finally {
      setIsCapturing(false);
    }
  }, [toast]);

  const clearCapture = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  return {
    isCapturing,
    capturedImage,
    captureScreen,
    clearCapture,
    error
  };
};