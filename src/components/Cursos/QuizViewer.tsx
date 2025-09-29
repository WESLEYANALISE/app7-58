import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Download, RotateCcw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LessonQuiz, LessonData, QuizQuestion } from '@/hooks/useLessonContent';

interface QuizViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: LessonQuiz | null;
  lesson: LessonData;
  onExportPDF: () => void;
}

type QuizMode = 'quiz' | 'review' | 'results';

export const QuizViewer = ({ 
  isOpen, 
  onClose, 
  content, 
  lesson, 
  onExportPDF 
}: QuizViewerProps) => {
  const [mode, setMode] = useState<QuizMode>('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  if (!content || !content.questoes || content.questoes.length === 0) return null;

  const currentQuestion = content.questoes[currentIndex];
  const totalQuestions = content.questoes.length;
  const answeredQuestions = Object.keys(answers).length;
  
  const score = content.questoes.reduce((acc, question) => {
    const userAnswer = answers[question.id];
    return userAnswer === question.resposta_correta ? acc + 1 : acc;
  }, 0);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const resetQuiz = () => {
    setMode('quiz');
    setCurrentIndex(0);
    setAnswers({});
    setSelectedAnswer('');
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    } else {
      setMode('results');
    }
  };

  const getLevelColor = (nivel: string) => {
    const colors = {
      facil: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      dificil: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[nivel as keyof typeof colors] || colors.medio;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (mode === 'results') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">Resultados do Quiz</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {lesson.area} • {lesson.tema}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onExportPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="py-6 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                  {percentage}%
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Quiz Concluído!</h3>
              <p className="text-muted-foreground">
                Você acertou {score} de {totalQuestions} questões
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalQuestions - score}</div>
                <div className="text-xs text-muted-foreground">Erros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setMode('review')} variant="outline">
                Ver Respostas
              </Button>
              <Button onClick={resetQuiz}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Refazer Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (mode === 'review') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">Revisão das Respostas</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {lesson.area} • {lesson.tema}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMode('results')} variant="outline" size="sm">
                Ver Resultados
              </Button>
              <Button onClick={onExportPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="overflow-auto p-4 space-y-6">
            {content.questoes.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.resposta_correta;
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Questão {index + 1}</span>
                      <Badge className={getLevelColor(question.nivel)}>
                        {question.nivel}
                      </Badge>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <h4 className="font-medium mb-4">{question.pergunta}</h4>

                  <div className="space-y-2 mb-4">
                    {Object.entries(question.alternativas).map(([key, value]) => (
                      <div
                        key={key}
                         className={`p-3 rounded border-2 ${
                           key === question.resposta_correta 
                             ? 'border-green-500 bg-muted text-foreground'
                             : key === userAnswer && !isCorrect
                             ? 'border-red-500 bg-muted text-foreground'
                             : 'border-border'
                         }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{key.toUpperCase()})</span>
                          <span className="text-sm">{value}</span>
                          {key === question.resposta_correta && (
                            <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                          )}
                          {key === userAnswer && !isCorrect && (
                            <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                   <div className="bg-muted/50 border border-border rounded p-3">
                     <h5 className="font-medium text-sm mb-2 text-foreground">Explicação:</h5>
                     <p className="text-sm text-foreground">{question.explicacao}</p>
                   </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-lesson-modal="quiz" className="max-w-[min(100vw,720px)] sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex-1">
            <DialogTitle className="text-lg sm:text-xl font-bold">{content.titulo}</DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {lesson.area} • {lesson.tema}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={resetQuiz} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-5">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Questão {currentIndex + 1} de {totalQuestions}
              </span>
              <Badge className={getLevelColor(currentQuestion.nivel)}>
                {currentQuestion.nivel}
              </Badge>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {answeredQuestions} respondidas
            </span>
          </div>

          <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="mb-4" />

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.pergunta}</h3>

            <div className="space-y-2">
              {Object.entries(currentQuestion.alternativas).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => !showFeedback && handleAnswerSelect(key)}
                  disabled={showFeedback}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all ${
                     selectedAnswer === key
                       ? showFeedback
                         ? key === currentQuestion.resposta_correta
                           ? 'border-green-500 bg-muted text-foreground'
                           : 'border-red-500 bg-muted text-foreground'
                         : 'border-primary bg-primary/5'
                       : showFeedback && key === currentQuestion.resposta_correta
                       ? 'border-green-500 bg-muted text-foreground'
                       : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-medium text-xs sm:text-sm">{key.toUpperCase()})</span>
                    <span className="text-sm">{value}</span>
                    {showFeedback && key === currentQuestion.resposta_correta && (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                    )}
                    {showFeedback && selectedAnswer === key && key !== currentQuestion.resposta_correta && (
                      <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                 <div className="bg-muted/50 border border-border rounded-lg p-4">
                   <h4 className="font-medium text-sm mb-2 text-foreground">Explicação:</h4>
                   <p className="text-sm text-foreground">{currentQuestion.explicacao}</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              disabled={currentIndex === 0}
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(prev => prev - 1);
                  setSelectedAnswer('');
                  setShowFeedback(false);
                }
              }}
            >
              Anterior
            </Button>

            {!showFeedback ? (
              <Button 
                onClick={handleConfirmAnswer}
                disabled={!selectedAnswer}
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentIndex === totalQuestions - 1 ? 'Ver Resultados' : 'Próxima'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};