import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

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
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0
  });

  const currentCard = flashcards[currentCardIndex];

  const virarCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleConhecido = () => {
    setSessionStats(prev => ({
      correct: prev.correct + 1,
      total: prev.total + 1
    }));
    proximoCard();
  };

  const handleRevisar = () => {
    setSessionStats(prev => ({
      correct: prev.correct,
      total: prev.total + 1
    }));
    proximoCard();
  };

  const proximoCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Fim da sessão
      setIsFlipped(false);
    }
  };

  const cardAnterior = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const reiniciar = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, total: 0 });
  };

  if (sessionStats.total > 0 && currentCardIndex === flashcards.length - 1 && sessionStats.total === flashcards.length) {
    // Tela de resultados
    const accuracy = (sessionStats.correct / sessionStats.total) * 100;

    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-background/50 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Sessão Concluída!</h2>
                <p className="text-muted-foreground">
                  {codeName} - Art. {articleNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-3xl font-bold text-primary">{sessionStats.correct}</p>
                  <p className="text-sm text-muted-foreground">Conhecidos</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-3xl font-bold">{sessionStats.total - sessionStats.correct}</p>
                  <p className="text-sm text-muted-foreground">Para Revisar</p>
                </div>
              </div>

              <div className="mb-6">
                <Progress value={accuracy} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aproveitamento: {accuracy.toFixed(0)}%
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={reiniciar}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Repetir
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Concluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
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
            <Progress 
              value={((currentCardIndex + 1) / flashcards.length) * 100} 
              className="w-32 h-2 mt-1" 
            />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {sessionStats.correct}/{sessionStats.total}
            </p>
            <p className="text-xs text-muted-foreground">Acertos</p>
          </div>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Card simples sem flip 3D */}
          <div className="mb-6">
            <Card 
              className="min-h-[400px] shadow-xl border-2 border-primary/30 bg-background/50"
            >
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
                  <div className="text-center px-6">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary opacity-20" />
                    <p className="text-xl font-medium leading-relaxed mb-6 text-foreground">
                      {currentCard?.pergunta || 'Pergunta não disponível'}
                    </p>
                    <Button 
                      onClick={virarCard}
                      variant="outline"
                      className="mt-4"
                    >
                      Ver Resposta
                    </Button>
                  </div>
                ) : (
                  <div className="text-center px-6 w-full">
                    <p className="text-base leading-relaxed mb-4 text-foreground">
                      {currentCard?.resposta || 'Resposta não disponível'}
                    </p>
                    {(currentCard?.exemplo || (currentCard as any)?.dica) && (
                      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm font-semibold text-primary mb-2">💡 Exemplo Prático</p>
                        <p className="text-sm text-foreground">{currentCard?.exemplo || (currentCard as any)?.dica}</p>
                      </div>
                    )}
                    <Button 
                      onClick={virarCard}
                      variant="outline"
                      className="mt-4"
                    >
                      Ver Pergunta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Botões de Ação */}
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-4 mb-4"
            >
              <Button
                onClick={handleRevisar}
                size="lg"
                variant="outline"
                className="h-14 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Preciso Revisar
              </Button>
              <Button
                onClick={handleConhecido}
                size="lg"
                className="h-14 bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Já Conheço
              </Button>
            </motion.div>
          )}

          {/* Navegação */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={cardAnterior}
              disabled={currentCardIndex === 0}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={proximoCard}
              disabled={currentCardIndex === flashcards.length - 1}
            >
              Próximo
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
