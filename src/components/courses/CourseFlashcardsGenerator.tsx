import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Lightbulb,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo: string;
}

interface CourseFlashcardsGeneratorProps {
  flashcards: Flashcard[];
  courseTitle: string;
  onBack: () => void;
}

export const CourseFlashcardsGenerator = ({
  flashcards,
  courseTitle,
  onBack
}: CourseFlashcardsGeneratorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleCorrect = () => {
    setStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    nextCard();
  };

  const handleIncorrect = () => {
    setStats(prev => ({ ...prev, total: prev.total + 1 }));
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, total: 0 });
  };

  if (flashcards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum flashcard disponível para este curso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
        <div className="text-center flex-1 mx-4">
          <h2 className="font-semibold text-lg mb-1">{courseTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} de {flashcards.length}
          </p>
        </div>
        <Button variant="ghost" onClick={resetSession}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-6 space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-primary">
            {stats.correct}/{stats.total} acertos
          </span>
        </div>
      </div>

      {/* Flashcard 3D */}
      <div className="perspective-1000 mb-6">
        <motion.div
          key={currentIndex}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 100
          }}
          className="preserve-3d w-full relative min-h-[450px]"
        >
          {/* Frente - Pergunta */}
          <div className="backface-hidden absolute inset-0">
            <Card 
              className="min-h-[450px] cursor-pointer shadow-xl border-2 border-primary/30 bg-gradient-to-br from-card to-card/50"
              onClick={handleFlip}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    Pergunta
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Card {currentIndex + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[350px] px-8">
                <BookOpen className="h-12 w-12 mb-6 text-primary opacity-20" />
                <p className="text-xl font-medium leading-relaxed text-center mb-8">
                  {currentCard.pergunta}
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique para ver a resposta
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Verso - Resposta + Exemplo */}
          <div className="backface-hidden absolute inset-0 rotate-y-180">
            <Card 
              className="min-h-[450px] cursor-pointer shadow-xl border-2 border-primary/30 bg-gradient-to-br from-card to-card/50"
              onClick={handleFlip}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-primary">
                    Resposta
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Card {currentIndex + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="min-h-[350px] px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Resposta:</h4>
                    <p className="text-base leading-relaxed text-foreground/90">
                      {currentCard.resposta}
                    </p>
                  </div>

                  {currentCard.exemplo && (
                    <div className="pt-4 border-t border-primary/20">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">
                            Exemplo Prático:
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {currentCard.exemplo}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      {isFlipped && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4 mb-4"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={handleIncorrect}
              className="border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Revisar
            </Button>
            <Button
              size="lg"
              onClick={handleCorrect}
              className="bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Conhece
            </Button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          onClick={handleFlip}
          className="text-sm"
        >
          {isFlipped ? 'Ver Pergunta' : 'Ver Resposta'}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
