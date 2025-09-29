import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TextMindMap {
  title: string;
  centralTopic: string;
  branches: {
    title: string;
    icon: string;
    subtopics: {
      title: string;
      content: string;
    }[];
  }[];
}

export const useMindMapPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportMindMapToPDF = async (mindMap: TextMindMap) => {
    setExporting(true);
    
    try {
      // Importação dinâmica do pdfMake para evitar problemas de inicialização
      const pdfMake = await import('pdfmake/build/pdfmake');
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      
      // Configurar fontes do pdfMake de forma segura
      if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
        (pdfMake as any).default.vfs = (pdfFonts as any).pdfMake.vfs;
      } else if ((pdfFonts as any).vfs) {
        (pdfMake as any).default.vfs = (pdfFonts as any).vfs;
      } else if ((pdfFonts as any).default && (pdfFonts as any).default.pdfMake) {
        (pdfMake as any).default.vfs = (pdfFonts as any).default.pdfMake.vfs;
      }
      // Converter emojis para texto alternativo para melhor compatibilidade
      const convertEmoji = (emoji: string) => {
        const emojiMap: { [key: string]: string } = {
          '🎯': '🎯 ',
          '📚': '📚 ',
          '⚖️': '⚖️ ',
          '💼': '💼 ',
          '🔍': '🔍 ',
          '📋': '📋 ',
          '💡': '💡 ',
          '🎓': '🎓 '
        };
        return emojiMap[emoji] || '• ';
      };

      // Construir o conteúdo dos ramos
      const branchesContent = mindMap.branches.map(branch => ({
        columns: [
          {
            width: '*',
            stack: [
              {
                text: `${convertEmoji(branch.icon)}${branch.title}`,
                style: 'branchTitle',
                margin: [0, 0, 0, 10] as [number, number, number, number]
              },
              ...branch.subtopics.map(subtopic => ({
                table: {
                  widths: ['*'],
                  body: [[{
                    stack: [
                      {
                        text: subtopic.title,
                        style: 'subtopicTitle'
                      },
                      {
                        text: subtopic.content,
                        style: 'subtopicContent',
                        margin: [0, 5, 0, 0] as [number, number, number, number]
                      }
                    ],
                    fillColor: '#F8F9FA',
                    margin: [8, 8, 8, 8] as [number, number, number, number]
                  }]]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 8] as [number, number, number, number]
              }))
            ],
            margin: [5, 10, 5, 10] as [number, number, number, number]
          }
        ],
        columnGap: 20,
        margin: [0, 0, 0, 20] as [number, number, number, number]
      }));

      // Construir o documento PDF
      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60] as [number, number, number, number],
        
        header: {
          text: 'Mapa Mental Personalizado',
          style: 'header',
          alignment: 'center',
          margin: [0, 15, 0, 0] as [number, number, number, number]
        },
        
        footer: function(currentPage: number, pageCount: number) {
          return {
            text: `Página ${currentPage} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
            alignment: 'center',
            fontSize: 8,
            color: '#666666',
            margin: [0, 15, 0, 0] as [number, number, number, number]
          };
        },
        
        content: [
          // Título do mapa
          {
            text: mindMap.title,
            style: 'title',
            alignment: 'center',
            margin: [0, 0, 0, 20] as [number, number, number, number]
          },
          
          // Tópico Central
          {
            table: {
              widths: ['*'],
              body: [[{
                text: [
                  { text: '🎯 TÓPICO CENTRAL\n\n', style: 'centralTopicLabel' },
                  { text: mindMap.centralTopic, style: 'centralTopicText' }
                ],
                alignment: 'center',
                fillColor: '#E3F2FD',
                margin: [15, 15, 15, 15] as [number, number, number, number]
              }]]
            },
            layout: {
              hLineWidth: () => 2,
              vLineWidth: () => 2,
              hLineColor: () => '#1976D2',
              vLineColor: () => '#1976D2'
            },
            margin: [0, 0, 0, 30] as [number, number, number, number]
          },

          // Título da seção
          {
            text: 'RAMOS PRINCIPAIS',
            style: 'sectionHeader',
            alignment: 'center',
            margin: [0, 0, 0, 20] as [number, number, number, number]
          },

          // Ramos do mapa mental
          ...branchesContent
        ],
        
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            color: '#1976D2'
          },
          title: {
            fontSize: 18,
            bold: true,
            color: '#1976D2'
          },
          centralTopicLabel: {
            fontSize: 14,
            bold: true,
            color: '#1976D2'
          },
          centralTopicText: {
            fontSize: 16,
            bold: true,
            color: '#333333'
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#424242'
          },
          branchTitle: {
            fontSize: 13,
            bold: true,
            color: '#1976D2'
          },
          subtopicTitle: {
            fontSize: 11,
            bold: true,
            color: '#424242'
          },
          subtopicContent: {
            fontSize: 10,
            color: '#666666',
            lineHeight: 1.4
          }
        },

        defaultStyle: {
          fontSize: 10,
          font: 'Roboto'
        }
      };

      // Gerar e baixar o PDF
      const pdfDocGenerator = (pdfMake as any).default.createPdf(docDefinition);
      
      const fileName = `Mapa_Mental_${mindMap.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfDocGenerator.download(fileName);

      toast({
        title: "PDF Exportado!",
        description: "O mapa mental foi exportado como PDF com formatação otimizada."
      });

    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar o PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    exportMindMapToPDF,
    exporting
  };
};