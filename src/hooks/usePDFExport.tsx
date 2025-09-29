import { useState } from 'react';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AnaliseRedacao } from '@/hooks/useRedacao';

export const usePDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarAnalise = async (analise: AnaliseRedacao, dadosAdicionais: {
    titulo: string;
    tipo: string;
    textoOriginal: string;
    pontosFortes: string[];
    pontosMelhoria: string[];
  }) => {
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

      // Header com gradiente (simulado com retângulos)
      pdf.setFillColor(139, 92, 246); // purple-500
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFillColor(59, 130, 246); // blue-500
      pdf.rect(0, 15, pageWidth, 15, 'F');

      // Título principal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANÁLISE DE REDAÇÃO', pageWidth / 2, 20, { align: 'center' });
      
      yPosition = 45;
      pdf.setTextColor(0, 0, 0);

      // Informações básicas
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(dadosAdicionais.titulo, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Tipo: ${dadosAdicionais.tipo.charAt(0).toUpperCase() + dadosAdicionais.tipo.slice(1)}`, 20, yPosition);
      yPosition += 8;

      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 15;

      // Linha separadora
      pdf.setDrawColor(139, 92, 246);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;

      // Nota
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(139, 92, 246);
      pdf.text(`NOTA: ${analise.nota}`, 20, yPosition);
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);

      // Resumo da análise
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO DA ANÁLISE:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addWrappedText(analise.resumo, 20, pageWidth - 40, 11);
      yPosition += 15;

      // Pontos Fortes
      checkPageBreak(50);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94); // green-500
      pdf.text('✓ PONTOS FORTES:', 20, yPosition);
      yPosition += 10;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      dadosAdicionais.pontosFortes.forEach((ponto, index) => {
        checkPageBreak(15);
        addWrappedText(`${index + 1}. ${ponto}`, 25, pageWidth - 45, 11);
        yPosition += 5;
      });
      yPosition += 10;

      // Pontos de Melhoria
      checkPageBreak(50);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(239, 68, 68); // red-500
      pdf.text('⚠ PONTOS DE MELHORIA:', 20, yPosition);
      yPosition += 10;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      dadosAdicionais.pontosMelhoria.forEach((ponto, index) => {
        checkPageBreak(15);
        addWrappedText(`${index + 1}. ${ponto}`, 25, pageWidth - 45, 11);
        yPosition += 5;
      });

      // Nova página para texto original
      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(139, 92, 246);
      pdf.text('TEXTO ORIGINAL:', 20, yPosition);
      yPosition += 15;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      addWrappedText(dadosAdicionais.textoOriginal, 20, pageWidth - 40, 10);

      // Footer em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      const now = new Date();
      const dataFormatada = now.toLocaleDateString('pt-BR');
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        
        // Footer com gradiente
        pdf.setFillColor(248, 250, 252); // gray-50
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        
        pdf.text(
          `Gerado em ${dataFormatada} - Redação Perfeita - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Exportar PDF para Supabase Storage
      const nomeArquivo = `analise-redacao-${dadosAdicionais.titulo.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      const pdfBlob = pdf.output('blob');
      const timestamp = Date.now();
      const filePath = `redacao/${timestamp}-${nomeArquivo}`;

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
        description: "Sua análise foi exportada com sucesso.",
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
    exportarAnalise
  };
};