import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<{ url: string; texto?: string }> => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use PDF, imagens (JPG, PNG, WebP) ou Word (DOCX).');
      }

      // Validar tamanho (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 20MB.');
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${fileName}`;
      
      setUploadProgress(30);

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('redacao-arquivos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Obter URL público (será privado, mas precisa da URL)
      const { data: urlData } = supabase.storage
        .from('redacao-arquivos')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      setUploadProgress(80);

      // Salvar informações no banco
      const { data: fileRecord, error: dbError } = await supabase
        .from('redacao_arquivos')
        .insert({
          user_id: userId,
          nome_arquivo: file.name,
          tipo_arquivo: file.type,
          url_arquivo: fileUrl,
          tamanho_arquivo: file.size,
          status_processamento: 'processando'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);

      let textoExtraido: string | undefined;

      // Extrair texto usando FormData para o edge function
      try {
        const formData = new FormData();
        formData.append('file', file);

        const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-text', {
          body: formData
        });

        if (extractData && !extractError && extractData.extractedText) {
          textoExtraido = extractData.extractedText;
          
          // Atualizar registro com texto extraído
          await supabase
            .from('redacao_arquivos')
            .update({ 
              texto_extraido: textoExtraido,
              status_processamento: 'concluido' 
            })
            .eq('id', fileRecord.id);
        }
      } catch (extractError) {
        console.warn('Erro na extração de texto:', extractError);
        // Não falhar o upload se OCR falhar
        await supabase
          .from('redacao_arquivos')
          .update({ status_processamento: 'erro_extracao' })
          .eq('id', fileRecord.id);
      }

      toast({
        title: "Upload concluído! 📎",
        description: "Arquivo enviado com sucesso.",
      });

      return { 
        url: fileUrl, 
        texto: textoExtraido 
      };

    } catch (err) {
      console.error('Erro no upload:', err);
      toast({
        title: "Erro no upload",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('redacao-arquivos')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao excluir arquivo:', err);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive",
      });
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadFile,
    deleteFile
  };
};