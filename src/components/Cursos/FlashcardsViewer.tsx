import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LessonFlashcards, LessonData } from '@/hooks/useLessonContent';

interface FlashcardsViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: LessonFlashcards | null;
  lesson: LessonData;
  onExportPDF: () => void;
}

export const FlashcardsViewer = ({ 
  isOpen, 
  onClose, 
  content, 
  lesson, 
  onExportPDF 
}: FlashcardsViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!content || !content.flashcards || content.flashcards.length === 0) return null;

  const currentCard = content.flashcards[currentIndex];
  const totalCards = content.flashcards.length;

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      conceito: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      legislacao: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      jurisprudencia: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      pratica: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category as keyof typeof colors] || colors.conceito;
  };

  if (showAll) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent data-lesson-modal="flashcards" className="max-w-[95vw] sm:max-w-[min(100vw,1100px)] max-h-[90vh] flex flex-col">{/* Mais responsivo */}
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">{content.titulo}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {lesson.area} • {lesson.tema} • Todos os Flashcards
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAll(false)} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Modo Estudo
              </Button>
              <Button onClick={onExportPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-auto p-3 sm:p-4">
            {content.flashcards.map((card, index) => (
              <div key={card.id} className="border rounded-lg p-3 space-y-2 bg-card">
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(card.categoria)}>
                    {card.categoria}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">#{index + 1}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium text-xs mb-1">Pergunta:</h4>
                    <p className="text-sm">{card.pergunta}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-xs mb-1">Resposta:</h4>
                    <p className="text-sm text-muted-foreground">{card.resposta}</p>
                  </div>
                   {card.dica && (
                     <div className="bg-muted/50 border border-border rounded p-2">
                       <h4 className="font-medium text-[11px] mb-1 text-foreground">💡 Dica:</h4>
                       <p className="text-xs text-foreground">{card.dica}</p>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-lesson-modal="flashcards" className="w-[95vw] sm:w-auto max-w-[95vw] sm:max-w-[min(100vw,700px)] lg:max-w-2xl max-h-[90vh] overflow-hidden px-3 sm:px-6">{/* Mais responsivo */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b flex-shrink-0">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg sm:text-xl font-bold truncate">{content.titulo}</DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {lesson.area} • {lesson.tema}
            </p>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button onClick={() => setShowAll(true)} variant="outline" size="sm" className="px-2 sm:px-3">
              <EyeOff className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Ver Todos</span>
            </Button>
            <Button onClick={onExportPDF} variant="outline" size="sm" className="px-2 sm:px-3">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm" className="px-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 sm:py-6 px-3 sm:px-4">{/* Conteúdo principal com scroll */}
          {/* Progress */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge className={getCategoryColor(currentCard.categoria)} variant="secondary">
                {currentCard.categoria}
              </Badge>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {currentIndex + 1} de {totalCards}
              </span>
            </div>
            <Button onClick={resetProgress} variant="ghost" size="sm" className="flex-shrink-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4 sm:mb-6 mx-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            />
          </div>

          {/* Flashcard */}
          <div className="relative h-40 sm:h-48 md:h-64 lg:h-72 mb-4 sm:mb-6 mx-0 sm:mx-2 px-1 overflow-hidden">{/* Altura mais responsiva para mobile e sem corte */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${isFlipped}`}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 cursor-pointer max-w-full overflow-x-hidden"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-full max-w-full h-full border-2 border-dashed border-primary/30 rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-background to-muted/30 hover:border-primary/50 transition-colors">{/* Padding mais responsivo */}
                  {!isFlipped ? (
                    <div className="w-full h-full flex flex-col justify-center">
                      <h3 className="text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3">Pergunta</h3>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed px-1 sm:px-2 flex-1 flex items-center justify-center text-center break-words">{currentCard.pergunta}</p>{/* Garantir centralização e quebra */}
                      <p className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground mt-2 sm:mt-3">Clique para ver a resposta</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-center">
                      <h3 className="text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3">Resposta</h3>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-xs sm:text-sm md:text-base leading-relaxed mb-2 sm:mb-3 px-1 sm:px-2 text-center">{currentCard.resposta}</p>{/* Garantir centralização */}
                         {currentCard.dica && (
                           <div className="bg-muted/50 border border-border rounded-lg p-2 sm:p-3 mt-2 sm:mt-3 mx-2">
                             <p className="text-[10px] sm:text-xs md:text-sm text-foreground">💡 <strong>Dica:</strong> {currentCard.dica}</p>
                           </div>
                         )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground mt-2 sm:mt-3">Clique para ver a pergunta</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2 px-2">
            <Button 
              onClick={prevCard} 
              variant="outline" 
              disabled={currentIndex === 0}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
              size="sm"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Anterior</span>
              <span className="sm:hidden">Ant</span>
            </Button>

            <div className="flex gap-1 sm:gap-2 px-2 overflow-x-auto max-w-[100px] sm:max-w-[150px] lg:max-w-none">
              {content.flashcards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsFlipped(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button 
              onClick={nextCard} 
              variant="outline"
              disabled={currentIndex === totalCards - 1}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
              size="sm"
            >
              <span className="hidden sm:inline">Próximo</span>
              <span className="sm:hidden">Prox</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};