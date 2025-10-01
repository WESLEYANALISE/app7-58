import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}
interface VadeMecumFlashcardsSessionProps {
  flashcards: Flashcard[];
  articleNumber: string;
  codeName: string;
  onClose: () => void;
}
export const VadeMecumFlashcardsSession = ({
  flashcards,
  articleNumber,
  codeName,
  onClose
}: VadeMecumFlashcardsSessionProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentCard = flashcards[currentCardIndex];
  
  const virarCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const proximoCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };
  const cardAnterior = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };
  
  return <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="ghost" onClick={onClose} size="sm">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Sair
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {currentCardIndex + 1} de {flashcards.length}
            </p>
            <Progress value={(currentCardIndex + 1) / flashcards.length * 100} className="w-32 h-2 mt-1" />
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-xs">
              {codeName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 px-[9px]">
        <div className="w-full max-w-2xl">
          {/* Card com flip 3D animado */}
          <div className="mb-6 perspective-1000">
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? 'back' : 'front'}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="min-h-[400px] shadow-xl border-2 border-primary/30 bg-background/50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {codeName}
                      </Badge>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Art. {articleNumber}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center min-h-[320px]">
                    {!isFlipped ? (
                      <motion.div 
                        className="text-center px-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary opacity-20" />
                        <p className="text-xl font-medium leading-relaxed mb-6 text-foreground">
                          {currentCard?.pergunta || 'Pergunta não disponível'}
                        </p>
                        <Button onClick={virarCard} variant="outline" className="mt-4">
                          Ver Resposta
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="text-center w-full px-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-base leading-relaxed mb-4 text-foreground">
                          {currentCard?.resposta || 'Resposta não disponível'}
                        </p>
                        {(currentCard?.exemplo || (currentCard as any)?.dica) && (
                          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-sm font-semibold text-primary mb-2">💡 Exemplo Prático</p>
                            <p className="text-sm text-foreground">{currentCard?.exemplo || (currentCard as any)?.dica}</p>
                          </div>
                        )}
                        <Button onClick={virarCard} variant="outline" className="mt-4">
                          Ver Pergunta
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navegação */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={cardAnterior} disabled={currentCardIndex === 0}>
              <ChevronLeft className="h-5 w-5 mr-1" />
              Anterior
            </Button>
            <Button variant="ghost" onClick={proximoCard} disabled={currentCardIndex === flashcards.length - 1}>
              Próximo
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>;
};