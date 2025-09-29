import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseVoiceRecordingResult {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
  canRecord: boolean;
}

export const useVoiceRecording = (): UseVoiceRecordingResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  // Check if recording is supported
  const canRecord = typeof navigator !== 'undefined' && 
                   navigator.mediaDevices && 
                   navigator.mediaDevices.getUserMedia &&
                   typeof MediaRecorder !== 'undefined';

  const startRecording = useCallback(async () => {
    if (!canRecord) {
      setError('Gravação não suportada neste navegador');
      toast({
        title: "Recurso não disponível",
        description: "Gravação de áudio não é suportada neste navegador/contexto.",
        variant: "destructive"
      });
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      console.log('🎤 Solicitando acesso ao microfone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Verificar suporte a tipos MIME
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mpeg'
      ];

      let supportedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedMimeType = mimeType;
          break;
        }
      }

      console.log('🎵 Tipo MIME suportado:', supportedMimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType || undefined
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('Erro no MediaRecorder:', event);
        setError('Erro durante a gravação');
        toast({
          title: "Erro na gravação",
          description: "Ocorreu um erro durante a gravação de áudio.",
          variant: "destructive"
        });
      };

      mediaRecorder.start(100); // Coletar dados a cada 100ms
      setIsRecording(true);
      
      console.log('🎤 Gravação iniciada');
      
      toast({
        title: "Gravando...",
        description: "Fale agora! Solte o botão quando terminar.",
      });

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      
      let message = 'Erro ao acessar o microfone';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          message = 'Permissão de microfone negada. Permita o acesso ao microfone e tente novamente.';
        } else if (err.name === 'NotFoundError') {
          message = 'Microfone não encontrado. Verifique se há um microfone conectado.';
        } else if (err.name === 'NotSupportedError') {
          message = 'Gravação não suportada neste contexto. Tente em uma aba normal do navegador.';
        }
      }
      
      setError(message);
      toast({
        title: "Erro no microfone",
        description: message,
        variant: "destructive"
      });
    }
  }, [canRecord, toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!mediaRecorderRef.current || !isRecording) {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = async () => {
        console.log('🛑 Gravação parada, processando áudio...');
        
        try {
          setIsTranscribing(true);
          
          if (audioChunksRef.current.length === 0) {
            throw new Error('Nenhum áudio foi gravado');
          }

          // Criar blob do áudio
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || 'audio/webm'
          });

          console.log('📦 Áudio coletado:', {
            size: audioBlob.size,
            type: audioBlob.type,
            chunks: audioChunksRef.current.length
          });

          if (audioBlob.size < 1000) {
            throw new Error('Áudio muito curto para transcrição');
          }

          // Converter para base64
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              console.log('📤 Enviando para transcrição...');
              
              const { data, error } = await supabase.functions.invoke('voice-transcription', {
                body: { audio: base64Audio }
              });

              if (error) {
                throw new Error(error.message || 'Erro na transcrição');
              }

              if (!data.success || !data.text) {
                throw new Error('Não foi possível transcrever o áudio');
              }

              const transcriptionText = data.text.trim();
              
              console.log('✅ Transcrição concluída:', transcriptionText);
              
              toast({
                title: "Transcrito com sucesso!",
                description: `"${transcriptionText.substring(0, 50)}${transcriptionText.length > 50 ? '...' : ''}"`,
              });

              resolve(transcriptionText);
              
            } catch (transcriptionError) {
              console.error('Erro na transcrição:', transcriptionError);
              const errorMessage = transcriptionError instanceof Error 
                ? transcriptionError.message 
                : 'Erro desconhecido na transcrição';
              
              setError(errorMessage);
              toast({
                title: "Erro na transcrição",
                description: errorMessage,
                variant: "destructive"
              });
              resolve(null);
            } finally {
              setIsTranscribing(false);
            }
          };

          reader.onerror = () => {
            const errorMsg = 'Erro ao processar áudio';
            setError(errorMsg);
            toast({
              title: "Erro no processamento",
              description: errorMsg,
              variant: "destructive"
            });
            setIsTranscribing(false);
            resolve(null);
          };

          reader.readAsDataURL(audioBlob);

        } catch (processingError) {
          console.error('Erro no processamento:', processingError);
          const errorMessage = processingError instanceof Error 
            ? processingError.message 
            : 'Erro no processamento do áudio';
          
          setError(errorMessage);
          toast({
            title: "Erro no processamento",
            description: errorMessage,
            variant: "destructive"
          });
          setIsTranscribing(false);
          resolve(null);
        }
      };

      // Parar a gravação
      mediaRecorder.stop();
      setIsRecording(false);

      // Parar todas as tracks do stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    });
  }, [isRecording, toast]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    error,
    canRecord
  };
};