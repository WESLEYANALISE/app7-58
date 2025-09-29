import { useState } from 'react';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PDFExportData {
  titulo: string;
  tipo: string;
  sections: {
    titulo: string;
    conteudo: string;
    destaque?: boolean;
  }[];
  metadata?: {
    autor?: string;
    data?: string;
    categoria?: string;
    [key: string]: any;
  };
}

export const useGenericPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarPDF = async (data: PDFExportData) => {
    setExporting(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Função para adicionar quebra de página se necessário
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Função para texto com quebra de linha e formatação markdown
      const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 12, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        // Processar markdown básico
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          checkPageBreak(fontSize * 0.35 + 2);
          
          // Verificar se é header (iniciado com #)
          if (line.startsWith('#')) {
            pdf.setFont('helvetica', 'bold');
            const headerText = line.replace(/^#+\s*/, '');
            pdf.text(headerText, x, yPosition);
            pdf.setFont('helvetica', 'normal');
          }
          // Verificar se contém texto em negrito (**texto**)
          else if (line.includes('**')) {
            let currentX = x;
            const parts = line.split('**');
            
            parts.forEach((part, index) => {
              if (index % 2 === 1) {
                // Texto em negrito
                pdf.setFont('helvetica', 'bold');
                pdf.text(part, currentX, yPosition);
                currentX += pdf.getTextWidth(part);
                pdf.setFont('helvetica', 'normal');
              } else {
                // Texto normal
                pdf.text(part, currentX, yPosition);
                currentX += pdf.getTextWidth(part);
              }
            });
          } else {
            pdf.text(line, x, yPosition);
          }
          
          yPosition += fontSize * 0.35 + 2;
        });
      };

      // Header com gradiente similar ao plano de estudo
      pdf.setFillColor(220, 38, 38); // red-600
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setFillColor(185, 28, 28); // red-700  
      pdf.rect(0, 12, pageWidth, 13, 'F');

      // Título principal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.tipo.toUpperCase(), pageWidth / 2, 17, { align: 'center' });
      yPosition = 35;

      // Título do documento
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      addWrappedText(data.titulo, 20, pageWidth - 40, 16, true);
      yPosition += 5;

      // Metadata se disponível
      if (data.metadata) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        
        const metadataText = Object.entries(data.metadata)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');
        
        if (metadataText) {
          pdf.text(metadataText, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 8;
        }
      }

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;

      // Seções do conteúdo
      data.sections.forEach((section, index) => {
        // Título da seção
        if (section.titulo) {
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          
          if (section.destaque) {
            // Fundo colorido para seções em destaque
            pdf.setFillColor(254, 226, 226); // red-100
            const textWidth = pdf.getTextWidth(section.titulo);
            pdf.rect(18, yPosition - 5, textWidth + 4, 8, 'F');
          }
          
          addWrappedText(section.titulo, 20, pageWidth - 40, 14, true);
          yPosition += 8;
        }

        // Conteúdo da seção
        if (section.conteudo) {
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          addWrappedText(section.conteudo, 20, pageWidth - 40, 11);
          yPosition += 10;
        }

        // Separador entre seções (exceto a última)
        if (index < data.sections.length - 1) {
          checkPageBreak(10);
          pdf.setDrawColor(230, 230, 230);
          pdf.line(40, yPosition, pageWidth - 40, yPosition);
          yPosition += 15;
        }
      });

      // Footer
      const now = new Date();
      const dataFormatada = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Adicionar footer em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Gerado em ${dataFormatada} - Direito Premium - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Gerar nome do arquivo
      const nomeArquivo = `${data.tipo.toLowerCase().replace(/\s+/g, '-')}-${data.titulo.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}.pdf`;
      const pdfBlob = pdf.output('blob');
      const timestamp = Date.now();
      const filePath = `exports/${timestamp}-${nomeArquivo}`;

      try {
        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('conversation-pdfs')
          .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Erro ao fazer upload:', uploadError);
          // Fallback para download local
          pdf.save(nomeArquivo);
          toast({
            title: "PDF Salvo Localmente",
            description: "O PDF foi baixado para seu dispositivo."
          });
          return;
        }

        // Obter URL público
        const { data: urlData } = supabase.storage
          .from('conversation-pdfs')
          .getPublicUrl(filePath);

        // Abrir PDF em nova aba
        if (urlData.publicUrl) {
          window.open(urlData.publicUrl, '_blank');
          toast({
            title: "PDF Exportado!",
            description: "O PDF foi aberto em uma nova aba."
          });
        } else {
          // Fallback para download local
          pdf.save(nomeArquivo);
          toast({
            title: "PDF Salvo Localmente",
            description: "O PDF foi baixado para seu dispositivo."
          });
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        // Fallback para download local
        pdf.save(nomeArquivo);
        toast({
          title: "PDF Salvo Localmente",
          description: "O PDF foi baixado para seu dispositivo."
        });
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportarPDF
  };
};