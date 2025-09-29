import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, FileText } from 'lucide-react';
import { LessonSummaryPDFExport } from './LessonSummaryPDFExport';
import type { LessonSummary, LessonData } from '@/hooks/useLessonContent';

interface LessonSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: LessonSummary | null;
  lesson: LessonData;
  onExportPDF?: () => void; // Agora opcional
}

export const LessonSummaryModal = ({ 
  isOpen, 
  onClose, 
  content, 
  lesson, 
  onExportPDF 
}: LessonSummaryModalProps) => {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-lesson-modal="summary" className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">{/* // Corrigido problema de scroll */}
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold">{content.titulo}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {lesson.area} • {lesson.tema}
            </p>
          </div>
          <div className="flex gap-2">
            {content && (
              <LessonSummaryPDFExport content={content} lesson={lesson} />
            )}
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6 py-4 pr-4">{/* // Garantindo scroll correto */}
            {/* Introdução */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Introdução
              </h3>
              <p className="text-muted-foreground leading-relaxed">{content.introducao}</p>
            </section>

            {/* Conceitos Principais */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Conceitos Principais</h3>
              <div className="space-y-4">
                {(content.conceitos_principais ?? []).map((conceito, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium text-primary mb-2">{conceito.conceito}</h4>
                    <p className="text-sm mb-3">{conceito.definicao}</p>
                    <div className="bg-muted/50 rounded p-3">
                      <span className="text-xs font-medium text-muted-foreground">EXEMPLO:</span>
                      <p className="text-sm mt-1">{conceito.exemplo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pontos Importantes */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Pontos Importantes</h3>
              <ul className="space-y-2">
                {(content.pontos_importantes ?? []).map((ponto, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{ponto}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Legislação Aplicável */}
            {content.legislacao_aplicavel && content.legislacao_aplicavel.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Legislação Aplicável</h3>
                <div className="space-y-3">
                  {content.legislacao_aplicavel.map((lei, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-medium">{lei.lei}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{lei.artigos}</p>
                      <p className="text-sm">{lei.relevancia}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Jurisprudência */}
            {content.jurisprudencia && content.jurisprudencia.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Jurisprudência</h3>
                <div className="space-y-3">
                  {content.jurisprudencia.map((jurisp, index) => (
                    <div key={index} className="bg-accent/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{jurisp.tribunal}</Badge>
                        <span className="font-medium text-sm">{jurisp.tema}</span>
                      </div>
                      <p className="text-sm">{jurisp.importancia}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Aplicação Prática */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Aplicação Prática</h3>
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm text-foreground">{content.aplicacao_pratica}</p>
              </div>
            </section>

            {/* Conclusão */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Conclusão</h3>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">{content.conclusao}</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};