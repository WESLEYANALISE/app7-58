import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResumoDetalhadoData {
  titulo: string;
  resumo: string;
  explicacao: string;
  pontosChave: string[];
  documento: string;
  dataAnalise: string;
}

export const useResumoDetalhadoPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarResumo = async (data: ResumoDetalhadoData) => {
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

      // Definição do documento PDF
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        
        header: function(currentPage: number, pageCount: number) {
          return [
            {
              text: 'RESUMO JURÍDICO DETALHADO',
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
                  lineColor: '#10B981'
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
                ],
                [
                  { text: 'Tipo de Resumo:', style: 'tableHeader' },
                  { text: 'Detalhado e Explicativo', style: 'tableCell' }
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

          // Explicação Detalhada
          {
            text: '📖 EXPLICAÇÃO DETALHADA',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            text: data.explicacao,
            style: 'content',
            margin: [0, 0, 0, 20]
          },

          // Pontos-Chave
          {
            text: '🎯 PONTOS-CHAVE',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.pontosChave.map(item => ({
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
            color: '#10B981',
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
            fontSize: 11,
            lineHeight: 1.4,
            color: '#374151',
            font: 'Roboto',
            margin: [0, 3, 0, 3]
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
      
      const fileName = `Resumo_Detalhado_${data.documento.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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