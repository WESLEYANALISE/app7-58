import { useState } from 'react';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { LessonSummary, LessonData } from './useLessonContent';

export const useLessonPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportLessonSummary = async (content: LessonSummary, lesson: LessonData) => {
    setExporting(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Função para quebra de página
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Função para texto com quebra de linha
      const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(fontSize * 0.35);
          pdf.text(line, x, yPosition);
          yPosition += fontSize * 0.35;
        });
      };

      // Header com gradiente
      pdf.setFillColor(139, 92, 246); // purple-500
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFillColor(59, 130, 246); // blue-500
      pdf.rect(0, 15, pageWidth, 15, 'F');

      // Título principal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO DA AULA', pageWidth / 2, 20, { align: 'center' });
      
      yPosition = 45;
      pdf.setTextColor(0, 0, 0);

      // Informações da aula
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(content.titulo, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${lesson.area} • ${lesson.tema}`, 20, yPosition);
      yPosition += 8;

      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 15;

      // Linha separadora
      pdf.setDrawColor(139, 92, 246);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;

      // Introdução
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INTRODUÇÃO:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addWrappedText(content.introducao, 20, pageWidth - 40, 11);
      yPosition += 15;

      // Conceitos Principais
      if (content.conceitos_principais && content.conceitos_principais.length > 0) {
        checkPageBreak(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(139, 92, 246);
        pdf.text('CONCEITOS PRINCIPAIS:', 20, yPosition);
        yPosition += 15;
        
        pdf.setTextColor(0, 0, 0);
        content.conceitos_principais.forEach((conceito, index) => {
          checkPageBreak(30);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          addWrappedText(`${index + 1}. ${conceito.conceito}`, 20, pageWidth - 40, 12);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          addWrappedText(conceito.definicao, 25, pageWidth - 45, 10);
          
          if (conceito.exemplo) {
            pdf.setFont('helvetica', 'italic');
            addWrappedText(`Exemplo: ${conceito.exemplo}`, 25, pageWidth - 45, 10);
          }
          yPosition += 10;
        });
      }

      // Pontos Importantes
      if (content.pontos_importantes && content.pontos_importantes.length > 0) {
        checkPageBreak(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(34, 197, 94);
        pdf.text('PONTOS IMPORTANTES:', 20, yPosition);
        yPosition += 15;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        
        content.pontos_importantes.forEach((ponto, index) => {
          checkPageBreak(15);
          addWrappedText(`• ${ponto}`, 25, pageWidth - 45, 11);
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Aplicação Prática
      if (content.aplicacao_pratica) {
        checkPageBreak(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246);
        pdf.text('APLICAÇÃO PRÁTICA:', 20, yPosition);
        yPosition += 10;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        addWrappedText(content.aplicacao_pratica, 20, pageWidth - 40, 11);
        yPosition += 15;
      }

      // Conclusão
      if (content.conclusao) {
        checkPageBreak(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(139, 92, 246);
        pdf.text('CONCLUSÃO:', 20, yPosition);
        yPosition += 10;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        addWrappedText(content.conclusao, 20, pageWidth - 40, 11);
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      const now = new Date();
      const dataFormatada = now.toLocaleDateString('pt-BR');
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        
        pdf.text(
          `Gerado em ${dataFormatada} - Resumo da Aula - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Exportar PDF para Supabase Storage
      const nomeArquivo = `resumo-${lesson.assunto.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      const pdfBlob = pdf.output('blob');
      const timestamp = Date.now();
      const filePath = `aulas/${timestamp}-${nomeArquivo}`;

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
          pdf.save(nomeArquivo);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        // Fallback para download local
        pdf.save(nomeArquivo);
      }

      toast({
        title: "PDF exportado!",
        description: "Resumo aberto em nova aba do navegador.",
      });

    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportLessonSummary
  };
};