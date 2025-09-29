import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AnaliseTecnica } from './useRedacao';

interface RedacaoTecnicaPDFData {
  titulo: string;
  analiseTecnica: AnaliseTecnica;
  documento: string;
  dataAnalise: string;
}

export const useRedacaoTecnicaPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarAnalise = async (data: RedacaoTecnicaPDFData) => {
    setExporting(true);
    
    try {
      const pdfMake = await import('pdfmake/build/pdfmake');
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      
      // Configurar fontes
      if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
        (pdfMake as any).default.vfs = (pdfFonts as any).pdfMake.vfs;
      } else if ((pdfFonts as any).vfs) {
        (pdfMake as any).default.vfs = (pdfFonts as any).vfs;
      } else if ((pdfFonts as any).default && (pdfFonts as any).default.pdfMake) {
        (pdfMake as any).default.vfs = (pdfFonts as any).default.pdfMake.vfs;
      }

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        
        header: function(currentPage: number, pageCount: number) {
          return [
            {
              text: 'ANÁLISE TÉCNICA JURÍDICA APROFUNDADA',
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
                  lineWidth: 2,
                  lineColor: '#8B5CF6'
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

          // Info do documento e pontuações
          {
            table: {
              widths: ['25%', '35%', '40%'],
              body: [
                [
                  { text: 'Documento:', style: 'tableHeader' },
                  { text: data.documento, style: 'tableCell' },
                  { text: 'Data da Análise:', style: 'tableHeader' }
                ],
                [
                  { text: 'Pontuação Geral:', style: 'tableHeader' },
                  { text: `${data.analiseTecnica.pontuacao.geral}/10`, style: 'tableCell', color: '#8B5CF6' },
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

          // Pontuações Detalhadas
          {
            text: '📊 PONTUAÇÕES DETALHADAS',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  { text: 'Técnica Jurídica:', style: 'scoreLabel' },
                  { text: `${data.analiseTecnica.pontuacao.tecnica}/10`, style: 'scoreValue' }
                ],
                [
                  { text: 'Fundamentação Legal:', style: 'scoreLabel' },
                  { text: `${data.analiseTecnica.pontuacao.fundamentacao}/10`, style: 'scoreValue' }
                ],
                [
                  { text: 'Estrutura:', style: 'scoreLabel' },
                  { text: `${data.analiseTecnica.pontuacao.estrutura}/10`, style: 'scoreValue' }
                ],
                [
                  { text: 'Linguagem Jurídica:', style: 'scoreLabel' },
                  { text: `${data.analiseTecnica.pontuacao.linguagem}/10`, style: 'scoreValue' }
                ]
              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
          },

          // Resumo Geral
          {
            text: '📄 RESUMO GERAL TÉCNICO',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            text: data.analiseTecnica.resumoGeral,
            style: 'content',
            margin: [0, 0, 0, 20]
          },

          // Fundamentação Legal
          {
            text: '⚖️ FUNDAMENTAÇÃO LEGAL',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.analiseTecnica.fundamentacaoLegal.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Legislação Aplicável
          {
            text: '📋 LEGISLAÇÃO APLICÁVEL',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.analiseTecnica.legislacaoAplicavel.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Jurisprudência
          {
            text: '🏛️ JURISPRUDÊNCIA RELEVANTE',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.analiseTecnica.jurisprudencia.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Aspectos Formais
          {
            text: '📐 ASPECTOS FORMAIS',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.analiseTecnica.aspectosFormais.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Aspectos de Conteúdo
          {
            text: '📝 ASPECTOS DE CONTEÚDO',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.analiseTecnica.aspectosConteudo.map(item => ({
              text: item,
              style: 'listItem'
            })),
            margin: [0, 0, 0, 20]
          },

          // Recomendações Técnicas
          {
            text: '💡 RECOMENDAÇÕES TÉCNICAS',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            ul: data.analiseTecnica.recomendacoesTecnicas.map(item => ({
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
            fontSize: 22,
            bold: true,
            color: '#1F2937',
            font: 'Roboto'
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#8B5CF6',
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
          },
          scoreLabel: {
            fontSize: 11,
            bold: true,
            color: '#1F2937'
          },
          scoreValue: {
            fontSize: 11,
            bold: true,
            color: '#8B5CF6',
            alignment: 'right'
          }
        },

        defaultStyle: {
          font: 'Roboto',
          fontSize: 10
        }
      };

      const pdfDocGenerator = (pdfMake as any).default.createPdf(docDefinition);
      const fileName = `Analise_Tecnica_Juridica_${data.documento.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfDocGenerator.download(fileName);

      toast({
        title: "Análise técnica exportada! 📋",
        description: "PDF com análise completa foi gerado",
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
    exportarAnalise,
    exporting
  };
};