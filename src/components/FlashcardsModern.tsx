import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  BookOpen,
  Target,
  Home,
  BarChart3,
  Plus,
  Play,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useFlashcardsData } from '@/hooks/useFlashcardsData';
import FlashcardsDashboard from './FlashcardsDashboard';
import StudyPlanCreator from './StudyPlanCreator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigation } from '@/context/NavigationContext';
import { FlashcardsPDFExport } from './FlashcardsModernPDF';

type ViewMode = 'dashboard' | 'area' | 'categorias' | 'estudo' | 'review' | 'createPlan';

const FlashcardsModern = () => {
  const { setCurrentFunction } = useNavigation();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  const {
    flashcards,
    areas,
    cardsForReview,
    metrics,
    loading,
    updateFlashcardProgress,
    saveStudySession,
    createStudyPlan,
    getTemasByArea
  } = useFlashcardsData();

  // Filtrar categorias baseado na área selecionada
  const categorias = useMemo(() => {
    return getTemasByArea(selectedArea);
  }, [selectedArea, getTemasByArea]);

  // Filtrar flashcards para estudo
  const flashcardsFiltrados = useMemo(() => {
    if (viewMode === 'review') {
      return cardsForReview;
    }
    
    let filtered = flashcards.filter(card => card.area === selectedArea);
    
    if (selectedCategorias.length > 0) {
      filtered = filtered.filter(card => selectedCategorias.includes(card.tema));
    }
    
    return filtered;
  }, [flashcards, selectedArea, selectedCategorias, viewMode, cardsForReview]);


  const handleConhecido = () => {
    const currentCard = flashcardsFiltrados[currentCardIndex];
    if (currentCard) {
      updateFlashcardProgress(currentCard.id.toString(), 'conhecido');
      setSessionStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      proximoCard();
    }
  };

  const handleRevisar = () => {
    const currentCard = flashcardsFiltrados[currentCardIndex];
    if (currentCard) {
      updateFlashcardProgress(currentCard.id.toString(), 'revisar');
      setSessionStats(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      proximoCard();
    }
  };

  const proximoCard = () => {
    if (currentCardIndex < flashcardsFiltrados.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      finalizarSessao();
    }
  };

  const cardAnterior = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const virarCard = () => {
    setIsFlipped(!isFlipped);
  };

  const iniciarEstudo = (area?: string, temas?: string[]) => {
    if (area) {
      setSelectedArea(area);
      setSelectedCategorias(temas || []);
      setViewMode('estudo');
    } else {
      setViewMode('area');
    }
    resetSession();
  };

  const iniciarRevisao = () => {
    setViewMode('review');
    resetSession();
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, total: 0 });
  };

  const finalizarSessao = () => {
    const accuracy = sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total) * 100 : 0;
    
    saveStudySession(
      selectedArea,
      selectedCategorias,
      sessionStats.total,
      sessionStats.correct,
      0 // Duration tracking could be added
    );

    setViewMode('dashboard');
    resetSession();
  };

  const voltarParaDashboard = () => {
    setViewMode('dashboard');
    setSelectedArea('');
    setSelectedCategorias([]);
    resetSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4 py-6"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentFunction(null)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Início</span>
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Flashcards Jurídicos
              </h1>
              <div className="w-20"></div>
            </div>
            
            <FlashcardsDashboard
              onStartStudy={iniciarEstudo}
              onCreatePlan={() => setViewMode('createPlan')}
              onViewReview={iniciarRevisao}
            />
            
            {/* Export PDF Button */}
            <div className="mt-6 flex justify-center">
              <FlashcardsPDFExport 
                flashcardsData={flashcards.map(card => ({
                  pergunta: card.pergunta,
                  resposta: card.resposta,
                  categoria: card.tema
                }))}
                sessionStats={{
                  total: flashcards.length,
                  acertos: 0,
                  erros: 0,
                  tempo: 'N/A'
                }}
                categoria="Todos"
              />
            </div>
            
            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-primary/20 p-4">
              <div className="flex justify-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center space-y-1 text-primary"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Dashboard</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('createPlan')}
                  className="flex flex-col items-center space-y-1"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Criar Plano</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => iniciarEstudo()}
                  className="flex flex-col items-center space-y-1"
                >
                  <Play className="h-5 w-5" />
                  <span className="text-xs">Estudar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={iniciarRevisao}
                  className="flex flex-col items-center space-y-1"
                >
                  <Eye className="h-5 w-5" />
                  <span className="text-xs">Revisar</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'createPlan' && (
          <motion.div
            key="createPlan"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
          >
            <StudyPlanCreator
              onBack={() => setCurrentFunction(null)}
              onPlanCreated={(plan) => {
                createStudyPlan(plan);
                setCurrentFunction(null);
              }}
            />
          </motion.div>
        )}

        {viewMode === 'area' && (
          <motion.div
            key="area"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="container mx-auto px-4 py-6"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentFunction(null)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Início</span>
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Selecionar Área
              </h1>
              <div className="w-20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => {
                const areaCards = flashcards.filter(card => card.area === area);
                return (
                  <motion.div
                    key={area}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                      onClick={() => {
                        setSelectedArea(area);
                        setViewMode('categorias');
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg leading-tight text-foreground">{area}</h3>
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            {areaCards.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {areaCards.length} {areaCards.length === 1 ? 'card' : 'cards'} disponíveis
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === 'categorias' && (
          <motion.div
            key="categorias"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="container mx-auto px-4 py-6"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => setViewMode('area')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </Button>
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentFunction(null)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Início</span>
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Criar Plano
              </h1>
              <div className="w-20"></div>
            </div>
              <div className="w-20"></div>
            </div>

            <div className="mb-6">
              <Button
                onClick={() => {
                  setSelectedCategorias([]);
                  setViewMode('estudo');
                }}
                className="w-full mb-4 bg-primary hover:bg-primary/90"
              >
                <Play className="h-5 w-5 mr-2" />
                Estudar Todos os Temas
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria) => {
                const isSelected = selectedCategorias.includes(categoria);
                const categoryCards = flashcards.filter(card => 
                  card.area === selectedArea && card.tema === categoria
                );

                return (
                  <motion.div
                    key={categoria}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'ring-2 ring-primary bg-primary/10' 
                          : 'hover:shadow-lg border-l-4 border-l-primary/50 bg-gradient-to-br from-primary/5 to-transparent'
                      }`}
                      onClick={() => {
                        setSelectedCategorias(prev => 
                          prev.includes(categoria)
                            ? prev.filter(c => c !== categoria)
                            : [...prev, categoria]
                        );
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold leading-tight">{categoria}</h3>
                          <Badge 
                            variant={isSelected ? "default" : "secondary"}
                            className={isSelected ? "bg-primary" : "bg-primary/20 text-primary"}
                          >
                            {categoryCards.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {categoryCards.length} {categoryCards.length === 1 ? 'card' : 'cards'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {selectedCategorias.length > 0 && (
              <div className="fixed bottom-4 left-4 right-4">
                <Button
                  onClick={() => setViewMode('estudo')}
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Estudo ({selectedCategorias.length} {selectedCategorias.length === 1 ? 'tema' : 'temas'})
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {(viewMode === 'estudo' || viewMode === 'review') && flashcardsFiltrados.length > 0 && (
          <motion.div
            key="estudo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="container mx-auto px-4 py-6 max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={voltarParaDashboard}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Sair</span>
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {currentCardIndex + 1} de {flashcardsFiltrados.length}
                </p>
                <Progress 
                  value={(currentCardIndex + 1) / flashcardsFiltrados.length * 100} 
                  className="w-32 h-2"
                />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {sessionStats.correct}/{sessionStats.total}
                </p>
                <p className="text-xs text-muted-foreground">Acertos</p>
              </div>
            </div>

            {/* Card com Flip 3D */}
            <div className="perspective-1000 mb-6">
              <motion.div
                key={currentCardIndex}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="preserve-3d w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card 
                  className="min-h-[400px] cursor-pointer shadow-xl border-2 border-primary/30 relative"
                  onClick={virarCard}
                >
                  {/* Frente do Card */}
                  <div className="backface-hidden absolute inset-0 bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {flashcardsFiltrados[currentCardIndex]?.area}
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {flashcardsFiltrados[currentCardIndex]?.tema}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[320px]">
                      <div className="text-center px-6">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary opacity-20" />
                        <p className="text-xl font-medium leading-relaxed mb-6 text-foreground">
                          {flashcardsFiltrados[currentCardIndex]?.pergunta || 'Pergunta não disponível'}
                        </p>
                        <p className="text-sm text-muted-foreground">Clique para ver a resposta</p>
                      </div>
                    </CardContent>
                  </div>

                  {/* Verso do Card */}
                  <div className="backface-hidden absolute inset-0 rotate-y-180 bg-card rounded-lg">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="default" className="bg-primary">
                          Resposta
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {flashcardsFiltrados[currentCardIndex]?.tema}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[320px]">
                      <div className="text-center px-6">
                        <p className="text-lg leading-relaxed mb-4 text-foreground">
                          {flashcardsFiltrados[currentCardIndex]?.resposta || 'Resposta não disponível'}
                        </p>
                        {flashcardsFiltrados[currentCardIndex]?.exemplo && (
                          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-sm font-semibold text-primary mb-2">💡 Exemplo</p>
                            <p className="text-sm text-foreground">{flashcardsFiltrados[currentCardIndex]?.exemplo}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Controles de Navegação */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="outline"
                onClick={cardAnterior}
                disabled={currentCardIndex === 0}
                size="lg"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-5 w-5" />
                Anterior
              </Button>

              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {currentCardIndex + 1} / {flashcardsFiltrados.length}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={proximoCard}
                size="lg"
                className="flex items-center gap-2"
              >
                Próximo
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Botões de Avaliação (somente quando virado) */}
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <Button
                  variant="outline"
                  onClick={handleRevisar}
                  size="lg"
                  className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Preciso Revisar
                </Button>
                <Button
                  onClick={handleConhecido}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Já Conheço
                </Button>
              </motion.div>
            )}

            {/* Session Stats Footer */}
            <div className="fixed bottom-4 left-4 right-4">
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-muted-foreground">Sessão:</span>
                      <span>{sessionStats.correct}/{sessionStats.total}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>
                        {sessionStats.total > 0 
                          ? Math.round((sessionStats.correct / sessionStats.total) * 100)
                          : 0
                        }% acertos
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {(viewMode === 'estudo' || viewMode === 'review') && flashcardsFiltrados.length === 0 && (
          <motion.div
            key="no-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-20 text-center"
          >
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum card encontrado</h2>
            <p className="text-muted-foreground mb-6">
              {viewMode === 'review' 
                ? 'Você não tem cards para revisar no momento.'
                : 'Não há cards disponíveis para os critérios selecionados.'
              }
            </p>
            <Button onClick={voltarParaDashboard}>
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .perspective-1000 {
          perspective: 1200px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}} />
    </div>
  );
};

export default FlashcardsModern;