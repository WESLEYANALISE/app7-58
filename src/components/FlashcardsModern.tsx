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
  Lightbulb,
  TrendingUp,
  BookOpen,
  Target,
  Home,
  BarChart3,
  Plus,
  Play,
  Eye
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
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
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

  const gerarDica = async (pergunta: string, resposta: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: `Com base nesta pergunta: "${pergunta}" e resposta: "${resposta}", gere uma dica útil e breve (máximo 2 linhas) que ajude a lembrar da resposta sem revelá-la completamente.`
        }
      });

      if (error) throw error;
      setHint(data.reply || 'Dica não disponível no momento.');
      setShowHint(true);
    } catch (error) {
      console.error('Erro ao gerar dica:', error);
      setHint('Dica não disponível no momento.');
      setShowHint(true);
    }
  };

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
      setShowHint(false);
      setHint('');
    } else {
      finalizarSessao();
    }
  };

  const cardAnterior = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
      setHint('');
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
    setShowHint(false);
    setHint('');
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

            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
            >
              <Card 
                className="min-h-[360px] cursor-pointer shadow-lg border-primary/20 bg-gradient-to-br from-card to-primary/5"
                onClick={virarCard}
              >
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
                <CardContent>
                  <div className="min-h-[220px] flex items-center justify-center p-6">
                    <div className="text-center">
                      <p className="text-lg leading-relaxed mb-4">
                        {isFlipped 
                          ? (flashcardsFiltrados[currentCardIndex]?.resposta || 'Resposta não disponível')
                          : (flashcardsFiltrados[currentCardIndex]?.pergunta || 'Pergunta não disponível')}
                      </p>
                      {isFlipped && flashcardsFiltrados[currentCardIndex]?.exemplo && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground font-medium">Exemplo:</p>
                          <p className="text-sm mt-1">{flashcardsFiltrados[currentCardIndex]?.exemplo}</p>
                        </div>
                      )}
                      {!isFlipped && (
                        <p className="text-sm text-muted-foreground mt-2">Toque para ver a resposta</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col space-y-4 mt-6"
              >
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => gerarDica(
                      flashcardsFiltrados[currentCardIndex]?.pergunta || '',
                      flashcardsFiltrados[currentCardIndex]?.resposta || ''
                    )}
                    disabled={showHint}
                    className="flex items-center space-x-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Dica IA</span>
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleRevisar}
                    className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Preciso Revisar
                  </Button>
                  <Button
                    onClick={handleConhecido}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Já Conheço
                  </Button>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={cardAnterior}
                    disabled={currentCardIndex === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={proximoCard}
                  >
                    {currentCardIndex === flashcardsFiltrados.length - 1 ? 'Finalizar' : 'Próximo'}
                  </Button>
                </div>
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
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}} />
    </div>
  );
};

export default FlashcardsModern;