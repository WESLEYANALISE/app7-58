import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResumoData {
  titulo: string;
  resumo: string;
  legislacaoRelacionada: string[];
  impactosPraticos: string[];
  jurisprudencia: string[];
  recomendacoes: string[];
  documento: string;
  dataAnalise: string;
}

export const useResumoPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarResumo = async (data: ResumoData) => {
    setExporting(true);
    
    try {
      // Importação dinâmica do pdfMake
      const pdfMake = await import('pdfmake/build/pdfmake');
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      
      // Configurar fontes do pdfMake
      if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
        (pdfMake as any).default.vfs = (pdfFonts as any).pdfMake.vfs;
      } else if ((pdfFonts as any).vfs) {
        (pdfMake as any).default.vfs = (pdfFonts as any).vfs;
      } else if ((pdfFonts as any).default && (pdfFonts as any).default.pdfMake) {
        (pdfMake as any).default.vfs = (pdfFonts as any).default.pdfMake.vfs;
      }

      // Função para quebrar texto em múltiplas linhas
      const addWrappedText = (text: string, maxWidth: number = 70) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
          if ((currentLine + word).length <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        return lines.map(line => ({ text: line, margin: [0, 2] }));
      };

      // Definição do documento PDF
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        
        header: function(currentPage: number, pageCount: number) {
          return [
            {
              text: 'RESUMO JURÍDICO PERSONALIZADO',
              style: 'header',
              alignment: 'center',
              margin: [40, 30, 40, 0]
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 40, y1: 0,
                  x2: 555, y2: 0,
                  lineWidth: 1,
                  lineColor: '#3B82F6'
                }
              ],
              margin: [0, 10, 0, 0]
            }
          ];
        },

        footer: function(currentPage: number, pageCount: number) {
          return [
            {
              canvas: [
                {
                  type: 'line',
                  x1: 40, y1: 0,
                  x2: 555, y2: 0,
                  lineWidth: 1,
                  lineColor: '#E5E7EB'
                }
              ],
              margin: [0, 0, 0, 10]
            },
            {
              columns: [
                {
                  text: `Gerado em: ${data.dataAnalise}`,
                  fontSize: 8,
                  color: '#6B7280',
                  alignment: 'left',
                  margin: [40, 0, 0, 20]
                },
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 8,
                  color: '#6B7280',
                  alignment: 'right',
                  margin: [0, 0, 40, 20]
                }
              ]
            }
          ];
        },

        content: [
          // Título principal
          {
            text: data.titulo,
            style: 'title',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },

          // Informações do documento
          {
            table: {
              widths: ['25%', '75%'],
              body: [
                [
                  { text: 'Documento:', style: 'tableHeader' },
                  { text: data.documento, style: 'tableCell' }
                ],
                [
                  { text: 'Data da Análise:', style: 'tableHeader' },
                  { text: data.dataAnalise, style: 'tableCell' }
                ]
              ]
            },
            layout: {
              hLineWidth: function() { return 0.5; },
              vLineWidth: function() { return 0.5; },
              hLineColor: function() { return '#E5E7EB'; },
              vLineColor: function() { return '#E5E7EB'; }
            },
            margin: [0, 0, 0, 20]
          },

          // Resumo Principal
          {
            text: '📄 RESUMO PRINCIPAL',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            text: data.resumo,
            style: 'content',
            margin: [0, 0, 0, 20]
          },

          // Legislação Relacionada
          {
            text: '⚖️ LEGISLAÇÃO RELACIONADA',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.legislacaoRelacionada.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Impactos Práticos
          {
            text: '🎯 IMPACTOS PRÁTICOS',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.impactosPraticos.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Jurisprudência Relevante
          {
            text: '🏛️ JURISPRUDÊNCIA RELEVANTE',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.jurisprudencia.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Recomendações
          {
            text: '💡 RECOMENDAÇÕES',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.recomendacoes.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          }
        ],

        styles: {
          header: {
            fontSize: 12,
            bold: true,
            color: '#1F2937',
            font: 'Roboto'
          },
          title: {
            fontSize: 20,
            bold: true,
            color: '#1F2937',
            font: 'Roboto'
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#3B82F6',
            font: 'Roboto'
          },
          content: {
            fontSize: 11,
            lineHeight: 1.5,
            color: '#374151',
            font: 'Roboto',
            alignment: 'justify'
          },
          listItem: {
            fontSize: 10,
            lineHeight: 1.4,
            color: '#374151',
            font: 'Roboto',
            margin: [0, 2, 0, 2]
          },
          tableHeader: {
            fontSize: 10,
            bold: true,
            color: '#1F2937',
            fillColor: '#F3F4F6'
          },
          tableCell: {
            fontSize: 10,
            color: '#374151'
          }
        },

        defaultStyle: {
          font: 'Roboto',
          fontSize: 10
        }
      };

      // Gerar e baixar o PDF
      const pdfDocGenerator = (pdfMake as any).default.createPdf(docDefinition);
      
      const fileName = `Resumo_Juridico_${data.documento.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfDocGenerator.download(fileName);

      toast({
        title: "PDF gerado com sucesso! 📄",
        description: "O resumo foi exportado para PDF",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível criar o arquivo PDF",
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