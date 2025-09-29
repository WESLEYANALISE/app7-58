import { useState } from 'react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { SubtemaResumo } from '@/hooks/useResumosJuridicos';

export const useResumosPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarResumo = async (subtema: SubtemaResumo, area: string) => {
    if (exporting) return;
    
    setExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add wrapped text
      const addWrappedText = (text: string, fontSize: number, fontStyle: string = 'normal', color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.35;
        
        checkPageBreak(lines.length * lineHeight + 10);
        
        lines.forEach((line: string) => {
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        yPosition += 5; // Extra spacing
      };

      // Header
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Jurídico', margin, 25);
      
      yPosition = 55;

      // Título do resumo
      addWrappedText(subtema.subtema || 'Resumo', 16, 'bold', [41, 128, 185]);
      yPosition += 5;

      // Área
      addWrappedText(`Área: ${area}`, 12, 'normal', [102, 102, 102]);
      yPosition += 10;

      // Linha separadora
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Conteúdos dos resumos
      const resumos = [
        { titulo: 'Resumo Detalhado', conteudo: subtema.resumoDetalhado },
        { titulo: 'Resumo Storytelling', conteudo: subtema.resumoStorytelling },
        { titulo: 'Resumo Compacto', conteudo: subtema.resumoCompacto }
      ];

      resumos.forEach((resumo, index) => {
        if (resumo.conteudo) {
          // Título da seção
          addWrappedText(resumo.titulo, 14, 'bold', [34, 139, 34]);
          yPosition += 5;

          // Conteúdo
          addWrappedText(resumo.conteudo, 11, 'normal');
          
          if (index < resumos.length - 1) {
            yPosition += 10;
            // Linha separadora entre seções
            doc.setDrawColor(240, 240, 240);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;
          }
        }
      });

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Exportar PDF para Supabase Storage
      const nomeArquivo = `resumo-${subtema.subtema?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const pdfBlob = doc.output('blob');
      const timestamp = Date.now();
      const filePath = `resumos/${timestamp}-${nomeArquivo}`;

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
          doc.save(nomeArquivo);
          return;
        }

        // Obter URL público
        const { data: urlData } = supabase.storage
          .from('conversation-pdfs')
          .getPublicUrl(filePath);

        // Abrir PDF em nova aba
        if (urlData.publicUrl) {
          window.open(urlData.publicUrl, '_blank');
        } else {
          // Fallback para download local
          doc.save(nomeArquivo);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        // Fallback para download local
        doc.save(nomeArquivo);
      }

      toast({
        title: "PDF exportado com sucesso!",
        description: "O resumo foi exportado em PDF.",
      });

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    exportarResumo,
    exporting
  };
};