import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import type { LessonSummary, LessonData } from '@/hooks/useLessonContent';

interface LessonSummaryPDFExportProps {
  content: LessonSummary;
  lesson: LessonData;
}

export const LessonSummaryPDFExport = ({ content, lesson }: LessonSummaryPDFExportProps) => {
  const [exporting, setExporting] = useState(false);

  const exportarPDF = async () => {
    if (!content) return;

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

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO DO VÍDEO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Título do resumo
      pdf.setFontSize(16);
      addWrappedText(content.titulo, 20, pageWidth - 40, 16);
      yPosition += 5;

      // Informações da aula
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Área: ${lesson.area} • Tema: ${lesson.tema}`, 20, yPosition);
      yPosition += 10;

      // Linha separadora
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Introdução
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INTRODUÇÃO:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addWrappedText(content.introducao, 20, pageWidth - 40, 11);
      yPosition += 10;

      // Conceitos Principais
      if (content.conceitos_principais && content.conceitos_principais.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONCEITOS PRINCIPAIS:', 20, yPosition);
        yPosition += 10;

        content.conceitos_principais.forEach((conceito, index) => {
          checkPageBreak(25);
          
          // Conceito
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${conceito.conceito}`, 25, yPosition);
          yPosition += 8;

          // Definição
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          addWrappedText(conceito.definicao, 30, pageWidth - 50, 10);
          yPosition += 3;

          // Exemplo
          if (conceito.exemplo) {
            pdf.setFont('helvetica', 'italic');
            pdf.text('Exemplo:', 30, yPosition);
            yPosition += 5;
            addWrappedText(conceito.exemplo, 35, pageWidth - 55, 9);
            yPosition += 5;
          }
        });
      }

      // Pontos Importantes
      if (content.pontos_importantes && content.pontos_importantes.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PONTOS IMPORTANTES:', 20, yPosition);
        yPosition += 10;

        content.pontos_importantes.forEach((ponto, index) => {
          checkPageBreak(15);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          addWrappedText(`• ${ponto}`, 25, pageWidth - 45, 10);
          yPosition += 3;
        });
        yPosition += 10;
      }

      // Legislação Aplicável
      if (content.legislacao_aplicavel && content.legislacao_aplicavel.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LEGISLAÇÃO APLICÁVEL:', 20, yPosition);
        yPosition += 10;

        content.legislacao_aplicavel.forEach((lei, index) => {
          checkPageBreak(20);
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text(`• ${lei.lei}`, 25, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          addWrappedText(`Artigos: ${lei.artigos}`, 30, pageWidth - 50, 10);
          addWrappedText(`Relevância: ${lei.relevancia}`, 30, pageWidth - 50, 10);
          yPosition += 5;
        });
      }

      // Jurisprudência
      if (content.jurisprudencia && content.jurisprudencia.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('JURISPRUDÊNCIA:', 20, yPosition);
        yPosition += 10;

        content.jurisprudencia.forEach((jurisp, index) => {
          checkPageBreak(20);
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text(`• ${jurisp.tribunal} - ${jurisp.tema}`, 25, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          addWrappedText(jurisp.importancia, 30, pageWidth - 50, 10);
          yPosition += 5;
        });
      }

      // Aplicação Prática
      if (content.aplicacao_pratica) {
        checkPageBreak(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('APLICAÇÃO PRÁTICA:', 20, yPosition);
        yPosition += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        addWrappedText(content.aplicacao_pratica, 25, pageWidth - 45, 11);
        yPosition += 10;
      }

      // Conclusão
      if (content.conclusao) {
        checkPageBreak(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONCLUSÃO:', 20, yPosition);
        yPosition += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        addWrappedText(content.conclusao, 25, pageWidth - 45, 11);
      }

      // Footer
      const now = new Date();
      const dataFormatada = now.toLocaleDateString('pt-BR');
      
      // Adicionar footer em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Gerado em ${dataFormatada} - Direito Premium - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Exportar PDF para Supabase Storage
      const nomeArquivo = `resumo-video-${content.titulo.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      const pdfBlob = pdf.output('blob');
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
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      onClick={exportarPDF}
      disabled={exporting || !content}
      variant="outline" 
      size="sm"
      className="flex items-center gap-2"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
};