import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RedacaoAnaliseData {
  titulo: string;
  tipo: string;
  texto_original: string;
  analise: any;
  analise_tecnica?: any;
  nota: number;
  pontos_fortes: string[];
  pontos_melhoria: string[];
}

export const useRedacaoPDFExport = () => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportarAnalise = async (data: RedacaoAnaliseData) => {
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

      // Função para criar cor baseada no tipo de redação
      const getCorTipo = (tipo: string) => {
        switch(tipo) {
          case 'parecer': return '#6366F1'; // Indigo
          case 'peca': return '#EF4444'; // Red
          default: return '#8B5CF6'; // Purple (dissertativa)
        }
      };

      const corPrimaria = getCorTipo(data.tipo);

      // Conteúdo base do documento
      const baseContent: any[] = [
        // Título e informações básicas
        {
          text: data.titulo,
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // Tabela de informações
        {
          table: {
            widths: ['25%', '75%'],
            body: [
              [
                { text: 'Tipo de Redação:', style: 'tableHeader' },
                { text: data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1), style: 'tableCell' }
              ],
              [
                { text: 'Nota Obtida:', style: 'tableHeader' },
                { text: `${data.nota}/10`, style: 'tableCell', color: data.nota >= 7 ? '#059669' : data.nota >= 5 ? '#D97706' : '#DC2626' }
              ],
              [
                { text: 'Data da Análise:', style: 'tableHeader' },
                { text: new Date().toLocaleString('pt-BR'), style: 'tableCell' }
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

        // Resumo da Análise
        {
          text: '📋 RESUMO DA ANÁLISE',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
          color: corPrimaria
        },
        {
          text: data.analise.resumo || 'Análise completa disponível nos demais itens.',
          style: 'content',
          margin: [0, 0, 0, 20]
        },

        // Pontos Fortes
        {
          text: '✅ PONTOS FORTES',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
          color: '#059669'
        },
        {
          ul: data.pontos_fortes.map(item => ({
            text: item,
            style: 'listItem'
          })),
          margin: [0, 0, 0, 20]
        },

        // Pontos de Melhoria
        {
          text: '🎯 OPORTUNIDADES DE MELHORIA',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
          color: '#D97706'
        },
        {
          ul: data.pontos_melhoria.map(item => ({
            text: item,
            style: 'listItem'
          })),
          margin: [0, 0, 0, 20]
        }
      ];

      // Adicionar análise técnica se disponível
      if (data.analise_tecnica) {
        const analise = data.analise_tecnica;
        
        // Legislação Relacionada
        if (analise.legislacaoRelacionada && analise.legislacaoRelacionada.length > 0) {
          baseContent.push(
            {
              text: '⚖️ LEGISLAÇÃO RELACIONADA',
              style: 'sectionHeader',
              margin: [0, 20, 0, 10],
              color: '#3B82F6'
            },
            {
              ul: analise.legislacaoRelacionada.map((item: string) => ({
                text: item,
                style: 'listItem'
              })),
              margin: [0, 0, 0, 20]
            }
          );
        }

        // Jurisprudência Relevante
        if (analise.jurisprudenciaRelevante && analise.jurisprudenciaRelevante.length > 0) {
          baseContent.push(
            {
              text: '🏛️ JURISPRUDÊNCIA RELEVANTE',
              style: 'sectionHeader',
              margin: [0, 20, 0, 10],
              color: '#7C3AED'
            },
            {
              ul: analise.jurisprudenciaRelevante.map((item: string) => ({
                text: item,
                style: 'listItem'
              })),
              margin: [0, 0, 0, 20]
            }
          );
        }

        // Impactos Práticos
        if (analise.impactosPraticos && analise.impactosPraticos.length > 0) {
          baseContent.push(
            {
              text: '🎯 IMPACTOS PRÁTICOS',
              style: 'sectionHeader',
              margin: [0, 20, 0, 10],
              color: '#059669'
            },
            {
              ul: analise.impactosPraticos.map((item: string) => ({
                text: item,
                style: 'listItem'
              })),
              margin: [0, 0, 0, 20]
            }
          );
        }

        // Recomendações Técnicas
        if (analise.recomendacoesTecnicas && analise.recomendacoesTecnicas.length > 0) {
          baseContent.push(
            {
              text: '💡 RECOMENDAÇÕES TÉCNICAS',
              style: 'sectionHeader',
              margin: [0, 20, 0, 10],
              color: '#DC2626'
            },
            {
              ul: analise.recomendacoesTecnicas.map((item: string) => ({
                text: item,
                style: 'listItem'
              })),
              margin: [0, 0, 0, 20]
            }
          );
        }
      }

      // Texto original em anexo
      if (data.texto_original && data.texto_original.length > 100) {
        baseContent.push(
          {
            text: '📄 TEXTO ORIGINAL',
            style: 'sectionHeader',
            margin: [0, 30, 0, 10],
            pageBreak: 'before' as any,
            color: '#6B7280'
          },
          {
            text: data.texto_original,
            style: {
              fontSize: 9,
              lineHeight: 1.3,
              color: '#4B5563',
              font: 'Roboto',
              alignment: 'justify'
            },
            margin: [0, 0, 0, 20]
          }
        );
      }

      // Definição do documento PDF
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        
        header: function(currentPage: number, pageCount: number) {
          return [
            {
              text: 'ANÁLISE DE REDAÇÃO JURÍDICA',
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
                  lineColor: corPrimaria
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
                  text: `Análise gerada em: ${new Date().toLocaleString('pt-BR')}`,
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

        content: baseContent,

        styles: {
          header: {
            fontSize: 12,
            bold: true,
            color: '#1F2937',
            font: 'Roboto'
          },
          title: {
            fontSize: 18,
            bold: true,
            color: '#1F2937',
            font: 'Roboto'
          },
          sectionHeader: {
            fontSize: 13,
            bold: true,
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
            fillColor: '#F9FAFB'
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

      // Gerar e fazer upload do PDF
      const pdfDocGenerator = (pdfMake as any).default.createPdf(docDefinition);
      
      // Gerar como blob para upload
      const pdfBlob = await new Promise<Blob>((resolve) => {
        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob);
        });
      });

      // Upload para Supabase
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const fileName = `Analise_Redacao_${data.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const filePath = `${userId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp-pdfs')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('temp-pdfs')
        .getPublicUrl(filePath);

      // Abrir PDF em nova aba
      window.open(urlData.publicUrl, '_blank');

      toast({
        title: "PDF gerado com sucesso! 📄",
        description: "A análise foi exportada e está sendo aberta em nova aba",
      });

    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      
      // Fallback: download local
      try {
        const pdfMake = await import('pdfmake/build/pdfmake');
        const pdfFonts = await import('pdfmake/build/vfs_fonts');
        
        if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
          (pdfMake as any).default.vfs = (pdfFonts as any).pdfMake.vfs;
        }

        const simpleDocDefinition = {
          content: [
            { text: data.titulo, style: 'title' },
            { text: `Nota: ${data.nota}/10`, style: 'subtitle', margin: [0, 10, 0, 20] },
            { text: 'Pontos Fortes:', style: 'header', margin: [0, 10, 0, 5] },
            { ul: data.pontos_fortes },
            { text: 'Pontos de Melhoria:', style: 'header', margin: [0, 20, 0, 5] },
            { ul: data.pontos_melhoria }
          ],
          styles: {
            title: { fontSize: 16, bold: true },
            subtitle: { fontSize: 12, bold: true },
            header: { fontSize: 12, bold: true }
          }
        };

        const pdfDocGenerator = (pdfMake as any).default.createPdf(simpleDocDefinition);
        const fileName = `Analise_Redacao_${data.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdfDocGenerator.download(fileName);
        
        toast({
          title: "PDF baixado localmente 📄",
          description: "A análise foi baixada para seu dispositivo",
        });
      } catch (fallbackError) {
        toast({
          title: "Erro ao gerar PDF",
          description: "Não foi possível criar o arquivo PDF",
          variant: "destructive",
        });
      }
    } finally {
      setExporting(false);
    }
  };

  return {
    exportarAnalise,
    exporting
  };
};