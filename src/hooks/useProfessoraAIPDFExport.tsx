import { useState } from 'react';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useProfessoraAIPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportConversationToPDF = async (messages: Message[], titulo: string = 'Conversa com Professora IA') => {
    setExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Função para adicionar quebra de página
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Cabeçalho
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text(titulo, pageWidth / 2, 25, { align: 'center' });
      yPosition = 50;

      // Data
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const data = new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Gerado em: ${data}`, margin, yPosition);
      yPosition += 15;

      // Mensagens
      messages.forEach((message, index) => {
        checkPageBreak(30);

        // Cabeçalho da mensagem
        doc.setFontSize(12);
        if (message.role === 'user') {
          doc.setTextColor(59, 130, 246);
          doc.text('👤 Você:', margin, yPosition);
        } else {
          doc.setTextColor(220, 38, 38);
          doc.text('👩‍🏫 Professora:', margin, yPosition);
        }
        yPosition += 8;

        // Conteúdo da mensagem
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Limpar markdown básico
        let content = message.content
          .replace(/\*\*(.*?)\*\*/g, '$1') // Negrito
          .replace(/\*(.*?)\*/g, '$1') // Itálico
          .replace(/#+\s/g, '') // Títulos
          .replace(/```[\s\S]*?```/g, '[código]') // Blocos de código
          .replace(/`(.*?)`/g, '$1'); // Código inline

        const lines = doc.splitTextToSize(content, maxWidth);
        
        lines.forEach((line: string) => {
          checkPageBreak(8);
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });

        yPosition += 10;

        // Linha divisória
        if (index < messages.length - 1) {
          checkPageBreak(5);
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        }
      });

      // Rodapé em todas as páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Professora IA - Assistente Jurídica | Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Tentar fazer upload para Supabase Storage
      try {
        const pdfBlob = doc.output('blob');
        const fileName = `conversa-professora-${Date.now()}.pdf`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('temp-pdfs')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('temp-pdfs')
          .getPublicUrl(fileName);

        toast({
          title: "PDF Exportado!",
          description: "Conversa salva com sucesso",
        });

        // Abrir PDF em nova aba
        window.open(urlData.publicUrl, '_blank');
        
        return urlData.publicUrl;
      } catch (uploadError) {
        console.warn('Erro ao fazer upload, fazendo download local:', uploadError);
        doc.save(`conversa-professora-${Date.now()}.pdf`);
        
        toast({
          title: "PDF Baixado",
          description: "Conversa salva localmente",
        });
      }

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao Exportar",
        description: "Não foi possível criar o PDF",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportConversationToPDF
  };
};
