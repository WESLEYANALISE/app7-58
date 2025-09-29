import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useGenericPDFExport } from '@/hooks/useGenericPDFExport';

interface NewsItem {
  id: string;
  Titulo: string;
  link?: string;
  resumo?: string;
  portal?: string;
  data?: string;
}

interface NewsPDFExportProps {
  selectedNews: NewsItem[];
  title?: string;
}

export const NewsPDFExport = ({ 
  selectedNews,
  title = "Notícias Jurídicas Selecionadas"
}: NewsPDFExportProps) => {
  const { exporting, exportarPDF } = useGenericPDFExport();

  const handleExport = () => {
    if (selectedNews.length === 0) return;

    const sections = [
      {
        titulo: "Resumo",
        conteudo: `Total de notícias selecionadas: ${selectedNews.length}\nData de compilação: ${new Date().toLocaleDateString('pt-BR')}`,
        destaque: true
      },
      {
        titulo: "Notícias",
        conteudo: selectedNews.map((news, index) => {
          return `**${index + 1}. ${news.Titulo}**\n` +
                 `${news.portal ? `Portal: ${news.portal}\n` : ''}` +
                 `${news.data ? `Data: ${news.data}\n` : ''}` +
                 `${news.link ? `Link: ${news.link}\n` : ''}` +
                 `${news.resumo ? `\nResumo: ${news.resumo}\n` : '\nResumo não disponível.\n'}` +
                 `\n---\n\n`;
        }).join('')
      }
    ];

    const dataExport = {
      titulo: title,
      tipo: "Compilação de Notícias Jurídicas",
      sections,
      metadata: {
        'Data de Compilação': new Date().toLocaleDateString('pt-BR'),
        'Total de Notícias': selectedNews.length.toString(),
        'Portais': [...new Set(selectedNews.map(n => n.portal).filter(Boolean))].join(', ') || 'Diversos'
      }
    };

    exportarPDF(dataExport);
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={exporting || selectedNews.length === 0}
      size="sm"
      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF ({selectedNews.length})
        </>
      )}
    </Button>
  );
};