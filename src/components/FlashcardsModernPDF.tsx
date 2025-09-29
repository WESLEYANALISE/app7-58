import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useGenericPDFExport } from '@/hooks/useGenericPDFExport';

interface FlashcardsPDFExportProps {
  flashcardsData: {
    pergunta: string;
    resposta: string;
    dificuldade?: string;
    categoria?: string;
  }[];
  sessionStats?: {
    total: number;
    acertos: number;
    erros: number;
    tempo?: string;
  };
  categoria?: string;
}

export const FlashcardsPDFExport = ({ 
  flashcardsData, 
  sessionStats,
  categoria = "Geral"
}: FlashcardsPDFExportProps) => {
  const { exporting, exportarPDF } = useGenericPDFExport();

  const handleExport = () => {
    const sections = [
      {
        titulo: "Informações da Sessão",
        conteudo: sessionStats 
          ? `Total de Cards: ${sessionStats.total}\nAcertos: ${sessionStats.acertos}\nErros: ${sessionStats.erros}\nTempo: ${sessionStats.tempo || 'Não registrado'}\nCategoria: ${categoria}`
          : `Total de Cards: ${flashcardsData.length}\nCategoria: ${categoria}`,
        destaque: true
      },
      {
        titulo: "Flashcards",
        conteudo: flashcardsData.map((card, index) => {
          return `**Pergunta ${index + 1}:**\n${card.pergunta}\n\n**Resposta:**\n${card.resposta}\n${card.dificuldade ? `\n**Dificuldade:** ${card.dificuldade}` : ''}\n\n---\n`;
        }).join('\n')
      }
    ];

    const dataExport = {
      titulo: `Flashcards - ${categoria}`,
      tipo: "Flashcards",
      sections,
      metadata: {
        'Data': new Date().toLocaleDateString('pt-BR'),
        'Categoria': categoria,
        'Total de Cards': flashcardsData.length.toString()
      }
    };

    exportarPDF(dataExport);
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={exporting || flashcardsData.length === 0}
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
          Exportar PDF
        </>
      )}
    </Button>
  );
};