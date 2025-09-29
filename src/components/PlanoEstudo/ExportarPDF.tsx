import jsPDF from 'jspdf';
import { PlanoEstudoGerado } from './types';
import { supabase } from '@/integrations/supabase/client';

export const exportarPDF = async (plano: PlanoEstudoGerado) => {
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
  pdf.text('PLANO DE ESTUDOS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Título do plano
  pdf.setFontSize(16);
  addWrappedText(plano.titulo, 20, pageWidth - 40, 16);
  yPosition += 5;

  // Linha separadora
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Resumo
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMO:', 20, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  addWrappedText(plano.resumo, 20, pageWidth - 40, 11);
  yPosition += 10;

  // Cronograma
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CRONOGRAMA DETALHADO:', 20, yPosition);
  yPosition += 10;

  plano.cronograma.forEach((dia, index) => {
    checkPageBreak(30);
    
    // Dia
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Dia ${dia.dia} (${dia.tempoTotal}h total)`, 20, yPosition);
    yPosition += 8;

    // Atividades
    dia.atividades.forEach((atividade, atIndex) => {
      checkPageBreak(20);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Tipo da atividade
      pdf.setFont('helvetica', 'bold');
      pdf.text(`• ${atividade.tipo.toUpperCase()} (${atividade.tempo}h):`, 25, yPosition);
      yPosition += 5;
      
      // Título da atividade
      pdf.setFont('helvetica', 'bold');
      addWrappedText(atividade.titulo, 30, pageWidth - 50, 10);
      yPosition += 2;
      
      // Descrição
      pdf.setFont('helvetica', 'normal');
      addWrappedText(atividade.descricao, 30, pageWidth - 50, 9);
      yPosition += 5;
    });
    
    yPosition += 5;
  });

  // Nova página para dicas e materiais
  pdf.addPage();
  yPosition = 20;

  // Dicas
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DICAS IMPORTANTES:', 20, yPosition);
  yPosition += 10;

  plano.dicas.forEach((dica, index) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    addWrappedText(`• ${dica}`, 25, pageWidth - 45, 11);
    yPosition += 3;
  });

  yPosition += 10;

  // Materiais
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MATERIAIS RECOMENDADOS:', 20, yPosition);
  yPosition += 10;

  plano.materiais.forEach((material, index) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    addWrappedText(`• ${material}`, 25, pageWidth - 45, 11);
    yPosition += 3;
  });

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
  const nomeArquivo = `plano-estudo-${plano.titulo.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  const pdfBlob = pdf.output('blob');
  const timestamp = Date.now();
  const filePath = `planos/${timestamp}-${nomeArquivo}`;

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
};