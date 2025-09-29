import { useState } from 'react';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ArtigoExportData {
  tipo: 'explicar' | 'exemplo' | 'apresentar';
  conteudo: string;
  numeroArtigo: string;
  nomecodigo: string;
  textoOriginal?: string;
}

export const useArtigoPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarArtigo = async (data: ArtigoExportData) => {
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

      // Função para texto com quebra de linha e markdown
      const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        
        // Processar markdown básico
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          checkPageBreak(fontSize * 0.35);
          
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
          
          yPosition += fontSize * 0.35;
        });
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const tipoTexto = data.tipo === 'explicar' ? 'EXPLICAÇÃO' : 
                       data.tipo === 'exemplo' ? 'EXEMPLO PRÁTICO' : 'APRESENTAÇÃO';
      pdf.text(`${tipoTexto} - ${data.nomecodigo.toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Artigo
      pdf.setFontSize(16);
      pdf.text(`Artigo ${data.numeroArtigo}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Linha separadora
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;

      // Texto original do artigo se disponível
      if (data.textoOriginal) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TEXTO DO ARTIGO:', 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        addWrappedText(data.textoOriginal, 20, pageWidth - 40, 11);
        yPosition += 10;

        // Linha separadora
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 15;
      }

      // Conteúdo principal
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${tipoTexto}:`, 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      addWrappedText(data.conteudo, 20, pageWidth - 40, 11);

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
      const nomeArquivo = `${data.tipo}-artigo-${data.numeroArtigo}-${data.nomecodigo.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      const pdfBlob = pdf.output('blob');
      const timestamp = Date.now();
      const filePath = `artigos/${timestamp}-${nomeArquivo}`;

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
    exportarArtigo
  };
};