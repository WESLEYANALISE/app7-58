import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useGenericPDFExport } from '@/hooks/useGenericPDFExport';
import { toast } from 'sonner';

interface CoursePDFExporterProps {
  courseTitle: string;
  courseArea: string;
  moduleName?: string;
  lessonTitle?: string;
  lessonContent: string;
  progress?: number;
  className?: string;
}

export const CoursePDFExporter = ({
  courseTitle,
  courseArea,
  moduleName,
  lessonTitle,
  lessonContent,
  progress = 0,
  className = ''
}: CoursePDFExporterProps) => {
  const { exporting, exportarPDF } = useGenericPDFExport();

  const handleExport = async () => {
    try {
      await exportarPDF({
        titulo: lessonTitle || courseTitle,
        tipo: 'Curso Preparatório',
        sections: [
          {
            titulo: 'Informações do Curso',
            conteudo: `**Área:** ${courseArea}\n\n${moduleName ? `**Módulo:** ${moduleName}\n\n` : ''}**Progresso:** ${Math.round(progress)}%`
          },
          {
            titulo: 'Conteúdo da Aula',
            conteudo: lessonContent
          }
        ],
        metadata: {
          area: courseArea,
          modulo: moduleName,
          progresso: `${Math.round(progress)}%`,
          dataGeracao: new Date().toLocaleDateString('pt-BR')
        }
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF do curso');
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      className={`border-primary/30 hover:bg-primary/10 ${className}`}
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Exportar PDF
        </>
      )}
    </Button>
  );
};
