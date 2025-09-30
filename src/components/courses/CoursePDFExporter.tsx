import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useGenericPDFExport } from '@/hooks/useGenericPDFExport';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CoursePDFExporterProps {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  content: string;
  progress?: number;
  variant?: 'default' | 'outline' | 'ghost';
}

export const CoursePDFExporter = ({
  courseTitle,
  moduleTitle,
  lessonTitle,
  content,
  progress = 0,
  variant = 'outline'
}: CoursePDFExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportarPDF } = useGenericPDFExport();
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      await exportarPDF({
        titulo: lessonTitle,
        tipo: `${courseTitle} - ${moduleTitle}`,
        sections: [
          {
            titulo: 'Informações do Curso',
            conteudo: `Curso: ${courseTitle}\n\nMódulo: ${moduleTitle}\n\nAula: ${lessonTitle}`
          },
          {
            titulo: 'Conteúdo da Aula',
            conteudo: content
          },
          {
            titulo: 'Progresso',
            conteudo: `Você assistiu ${Math.round(progress)}% desta aula.`
          }
        ]
      });

      toast({
        title: "PDF exportado com sucesso!",
        description: "O conteúdo da aula foi salvo em PDF.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Exportar PDF
        </>
      )}
    </Button>
  );
};
