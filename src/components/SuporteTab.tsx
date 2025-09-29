import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Upload, MessageCircle, Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
interface SuporteFormData {
  nome: string;
  email: string;
  assunto: string;
  descricao: string;
  imagem?: FileList;
}
export const SuporteTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const form = useForm<SuporteFormData>();
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log('Iniciando upload da imagem:', file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `suporte/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from('support-images').upload(filePath, file);
      if (uploadError) {
        console.error('Erro no upload da imagem:', uploadError);
        return null;
      }
      const {
        data
      } = supabase.storage.from('support-images').getPublicUrl(filePath);
      console.log('Upload concluído, URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      return null;
    }
  };
  const submitToGoogleSheets = async (data: any) => {
    try {
      console.log('Enviando dados para Google Sheets:', data);
      const SHEET_URL = 'https://sheetdb.io/api/v1/ekjnh0u3gmc8q';
      const response = await fetch(SHEET_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Nome: data.nome,
          email: data.email,
          assunto: data.assunto,
          imagem: data.imagem_url || '',
          descricao: data.descricao
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro HTTP:', response.status, errorText);
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log('Dados salvos com sucesso no Google Sheets:', result);
      return result;
    } catch (error) {
      console.error('Erro ao enviar para Google Sheets:', error);
      throw error;
    }
  };
  const submitToSupabase = async (data: any) => {
    try {
      console.log('Enviando dados para Supabase:', data);
      const {
        error
      } = await supabase.from('suporte_requests').insert([data]);
      if (error) {
        console.error('Erro ao inserir no Supabase:', error);
        throw error;
      }
      console.log('Dados salvos com sucesso no Supabase');
    } catch (error) {
      console.error('Erro detalhado ao enviar para Supabase:', error);
      throw error;
    }
  };
  const onSubmit = async (data: SuporteFormData) => {
    console.log('Iniciando envio do formulário:', data);
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        console.log('Fazendo upload da imagem...');
        const uploadedUrl = await uploadImage(selectedImage);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('Imagem carregada com sucesso');
        } else {
          console.warn('Falha no upload da imagem, continuando sem imagem');
          toast({
            title: "Aviso",
            description: "Não foi possível fazer upload da imagem. Enviando formulário sem imagem...",
            variant: "destructive"
          });
        }
      }
      const submitData = {
        nome: data.nome || 'Não informado',
        email: data.email || 'Não informado',
        assunto: data.assunto || 'Não informado',
        descricao: data.descricao || '',
        imagem_url: imageUrl,
        data_envio: new Date().toISOString(),
        status: 'Pendente'
      };
      console.log('Dados a serem enviados:', submitData);
      try {
        await submitToGoogleSheets(submitData);
        console.log('Dados salvos com sucesso no Google Sheets');
        toast({
          title: "Solicitação enviada com sucesso!",
          description: "Sua solicitação foi registrada no Google Sheets. Retornaremos em até 24 horas!"
        });
      } catch (sheetsError) {
        console.warn('Erro no Google Sheets, tentando Supabase:', sheetsError);
        try {
          await submitToSupabase(submitData);
          toast({
            title: "Solicitação enviada com sucesso!",
            description: "Sua solicitação foi registrada. Retornaremos em até 24 horas!"
          });
        } catch (supabaseError) {
          console.warn('Erro no Supabase, salvando localmente:', supabaseError);
          const existingRequests = JSON.parse(localStorage.getItem('suporte_requests') || '[]');
          existingRequests.push({
            ...submitData,
            id: Date.now()
          });
          localStorage.setItem('suporte_requests', JSON.stringify(existingRequests));
          toast({
            title: "Solicitação registrada!",
            description: "Sua solicitação foi salva localmente. Entre em contato conosco diretamente se necessário."
          });
        }
      }
      form.reset();
      setSelectedImage(null);
      console.log('Formulário resetado com sucesso');
    } catch (error) {
      console.error('Erro completo no envio:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Arquivo selecionado:', file.name, 'Tamanho:', file.size);
      setSelectedImage(file);
    }
  };
  return <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        
        
      </div>

      

      <Card>
        
        
      </Card>
    </div>;
};