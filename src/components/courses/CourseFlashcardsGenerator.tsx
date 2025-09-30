import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  example: string;
}

interface CourseFlashcardsGeneratorProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export const CourseFlashcardsGenerator = ({
  flashcards,
  onClose
}: CourseFlashcardsGeneratorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [reviewCards, setReviewCards] = useState<Set<string>>(new Set());

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKnow = () => {
    setKnownCards(prev => new Set([...prev, currentCard.id]));
    reviewCards.delete(currentCard.id);
    handleNext();
  };

  const handleReview = () => {
    setReviewCards(prev => new Set([...prev, currentCard.id]));
    knownCards.delete(currentCard.id);
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setReviewCards(new Set());
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Flashcards do Curso</h2>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} de {flashcards.length}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <Badge variant="default" className="bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              {knownCards.size} conhecidos
            </Badge>
            <Badge variant="secondary">
              <RotateCcw className="w-3 h-3 mr-1" />
              {reviewCards.size} para revisar
            </Badge>
          </div>
        </div>

        {/* Flashcard */}
        <div 
          className="relative h-96 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="h-full border-2">
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  {!isFlipped ? (
                    <>
                      <Badge className="mb-2">Pergunta</Badge>
                      <h3 className="text-2xl font-bold">{currentCard.question}</h3>
                      <p className="text-sm text-muted-foreground mt-4">
                        Clique para ver a resposta
                      </p>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="mb-2">Resposta</Badge>
                      <div className="space-y-4">
                        <p className="text-lg">{currentCard.answer}</p>
                        <div className="border-t pt-4 mt-4">
                          <Badge variant="outline" className="mb-2">Exemplo Prático</Badge>
                          <p className="text-sm text-muted-foreground italic">
                            {currentCard.example}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {isFlipped && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReview}
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Revisar
              </Button>
              <Button
                variant="default"
                onClick={handleKnow}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Conheço
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={currentIndex === flashcards.length - 1 ? handleReset : handleNext}
          >
            {currentIndex === flashcards.length - 1 ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
