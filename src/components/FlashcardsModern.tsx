import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, TrendingUp, BookOpen, Target, Home, BarChart3, Plus, Play, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFlashcardsData } from '@/hooks/useFlashcardsData';
import FlashcardsDashboard from './FlashcardsDashboard';
import StudyPlanCreator from './StudyPlanCreator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigation } from '@/context/NavigationContext';
import { FlashcardsPDFExport } from './FlashcardsModernPDF';

// Sons de interação
const playFlipSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

const playNavigateSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 600;
  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.08);
};

type ViewMode = 'dashboard' | 'area' | 'categorias' | 'estudo' | 'review' | 'createPlan';
const FlashcardsModern = () => {
  const {
    setCurrentFunction
  } = useNavigation();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0
  });
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
      setSessionStats(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1
      }));
      proximoCard();
    }
  };
  const handleRevisar = () => {
    const currentCard = flashcardsFiltrados[currentCardIndex];
    if (currentCard) {
      updateFlashcardProgress(currentCard.id.toString(), 'revisar');
      setSessionStats(prev => ({
        correct: prev.correct,
        total: prev.total + 1
      }));
      proximoCard();
    }
  };
  const proximoCard = () => {
    if (currentCardIndex < flashcardsFiltrados.length - 1) {
      playNavigateSound();
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      finalizarSessao();
    }
  };
  
  const cardAnterior = () => {
    if (currentCardIndex > 0) {
      playNavigateSound();
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };
  
  const virarCard = useCallback(() => {
    playFlipSound();
    setIsFlipped(!isFlipped);
  }, [isFlipped]);
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
    setSessionStats({
      correct: 0,
      total: 0
    });
  };
  const finalizarSessao = () => {
    const accuracy = sessionStats.total > 0 ? sessionStats.correct / sessionStats.total * 100 : 0;
    saveStudySession(selectedArea, selectedCategorias, sessionStats.total, sessionStats.correct, 0 // Duration tracking could be added
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
  return <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' && <motion.div key="dashboard" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setCurrentFunction(null)} className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Início</span>
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Flashcards Jurídicos
              </h1>
              <div className="w-20"></div>
            </div>
            
            <FlashcardsDashboard onStartStudy={iniciarEstudo} onCreatePlan={() => setViewMode('createPlan')} onViewReview={iniciarRevisao} />
            
            {/* Export PDF Button */}
            <div className="mt-6 flex justify-center">
              <FlashcardsPDFExport flashcardsData={flashcards.map(card => ({
            pergunta: card.pergunta,
            resposta: card.resposta,
            categoria: card.tema
          }))} sessionStats={{
            total: flashcards.length,
            acertos: 0,
            erros: 0,
            tempo: 'N/A'
          }} categoria="Todos" />
            </div>
            
            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-primary/20 p-4">
              <div className="flex justify-center space-x-6">
                <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 text-primary">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Dashboard</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setViewMode('createPlan')} className="flex flex-col items-center space-y-1">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Criar Plano</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => iniciarEstudo()} className="flex flex-col items-center space-y-1">
                  <Play className="h-5 w-5" />
                  <span className="text-xs">Estudar</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={iniciarRevisao} className="flex flex-col items-center space-y-1">
                  <Eye className="h-5 w-5" />
                  <span className="text-xs">Revisar</span>
                </Button>
              </div>
            </div>
          </motion.div>}

        {viewMode === 'createPlan' && <motion.div key="createPlan" initial={{
        opacity: 0,
        x: 300
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: -300
      }}>
            <StudyPlanCreator onBack={() => setCurrentFunction(null)} onPlanCreated={plan => {
          createStudyPlan(plan);
          setCurrentFunction(null);
        }} />
          </motion.div>}

        {viewMode === 'area' && <motion.div key="area" initial={{
        opacity: 0,
        x: 300
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: -300
      }} className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setCurrentFunction(null)} className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Início</span>
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Selecionar Área
              </h1>
              <div className="w-20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map(area => {
            const areaCards = flashcards.filter(card => card.area === area);
            return <motion.div key={area} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }}>
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" onClick={() => {
                setSelectedArea(area);
                setViewMode('categorias');
              }}>
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
                  </motion.div>;
          })}
            </div>
          </motion.div>}

        {viewMode === 'categorias' && <motion.div key="categorias" initial={{
        opacity: 0,
        x: 300
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: -300
      }} className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setViewMode('area')} className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </Button>
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setCurrentFunction(null)} className="flex items-center space-x-2">
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
              <Button onClick={() => {
            setSelectedCategorias([]);
            setViewMode('estudo');
          }} className="w-full mb-4 bg-primary hover:bg-primary/90">
                <Play className="h-5 w-5 mr-2" />
                Estudar Todos os Temas
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map(categoria => {
            const isSelected = selectedCategorias.includes(categoria);
            const categoryCards = flashcards.filter(card => card.area === selectedArea && card.tema === categoria);
            return <motion.div key={categoria} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }}>
                    <Card className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:shadow-lg border-l-4 border-l-primary/50 bg-gradient-to-br from-primary/5 to-transparent'}`} onClick={() => {
                setSelectedCategorias(prev => prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]);
              }}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold leading-tight">{categoria}</h3>
                          <Badge variant={isSelected ? "default" : "secondary"} className={isSelected ? "bg-primary" : "bg-primary/20 text-primary"}>
                            {categoryCards.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {categoryCards.length} {categoryCards.length === 1 ? 'card' : 'cards'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>;
          })}
            </div>

            {selectedCategorias.length > 0 && <div className="fixed bottom-4 left-4 right-4">
                <Button onClick={() => setViewMode('estudo')} className="w-full bg-primary hover:bg-primary/90 shadow-lg" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Estudo ({selectedCategorias.length} {selectedCategorias.length === 1 ? 'tema' : 'temas'})
                </Button>
              </div>}
          </motion.div>}

        {(viewMode === 'estudo' || viewMode === 'review') && flashcardsFiltrados.length > 0 && <motion.div key="estudo" initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 1.1
      }} className="h-screen flex flex-col bg-background">
            {/* Header Minimalista */}
            <div className="flex-shrink-0 px-4 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={voltarParaDashboard} className="text-primary">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Sair
                </Button>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {currentCardIndex + 1} de {flashcardsFiltrados.length}
                  </p>
                  <Progress value={(currentCardIndex + 1) / flashcardsFiltrados.length * 100} className="w-32 h-1.5 mt-1" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{sessionStats.correct}/{sessionStats.total}</p>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
              </div>
            </div>

            {/* Card Container - Responsivo */}
            <div className="flex-1 flex items-center justify-center px-4 py-2 overflow-hidden">
              <div className="w-full max-w-md h-full max-h-[480px] perspective-1000">
                <motion.div
                  key={currentCardIndex}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="preserve-3d w-full h-full relative"
                >
                  {/* Frente do Card - Minimalista */}
                  <div className="backface-hidden absolute inset-0">
                    <Card 
                      className="h-full cursor-pointer border-2 border-primary/30 bg-background/95 backdrop-blur flex flex-col"
                      onClick={virarCard}
                    >
                      <CardHeader className="flex-shrink-0 pb-2 pt-3 px-4">
                        <div className="flex justify-between items-center gap-2">
                          <Badge variant="outline" className="border-primary/40 text-primary text-xs truncate max-w-[45%]">
                            {flashcardsFiltrados[currentCardIndex]?.area}
                          </Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs truncate max-w-[45%]">
                            {flashcardsFiltrados[currentCardIndex]?.tema}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
                        <BookOpen className="h-8 w-8 mb-4 text-primary/30" />
                        <p className="text-base sm:text-lg font-medium text-center leading-relaxed text-foreground break-words">
                          {flashcardsFiltrados[currentCardIndex]?.pergunta || 'Pergunta não disponível'}
                        </p>
                      </CardContent>

                      <div className="flex-shrink-0 pb-3 px-4">
                        <p className="text-xs text-center text-muted-foreground">Toque para ver a resposta</p>
                      </div>
                    </Card>
                  </div>

                  {/* Verso do Card - Minimalista */}
                  <div className="backface-hidden absolute inset-0 rotate-y-180">
                    <Card 
                      className="h-full cursor-pointer border-2 border-primary/30 bg-background/95 backdrop-blur flex flex-col"
                      onClick={virarCard}
                    >
                      <CardHeader className="flex-shrink-0 pb-2 pt-3 px-4">
                        <div className="flex justify-between items-center">
                          <Badge className="bg-primary text-primary-foreground text-xs">Resposta</Badge>
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs truncate max-w-[60%]">
                            {flashcardsFiltrados[currentCardIndex]?.tema}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 overflow-y-auto p-4">
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words mb-3">
                          {flashcardsFiltrados[currentCardIndex]?.resposta || 'Resposta não disponível'}
                        </p>
                        
                        {flashcardsFiltrados[currentCardIndex]?.exemplo && (
                          <div className="mt-3 p-2.5 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-xs font-semibold text-primary mb-1">💡 Exemplo</p>
                            <p className="text-xs leading-relaxed text-foreground break-words">
                              {flashcardsFiltrados[currentCardIndex]?.exemplo}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Navegação - Minimalista e compacta */}
            <div className="flex-shrink-0 px-4 py-3">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={cardAnterior} 
                  disabled={currentCardIndex === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                <p className="text-xl font-bold text-primary">
                  {currentCardIndex + 1} / {flashcardsFiltrados.length}
                </p>

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={proximoCard}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Botões de Avaliação - Compactos */}
              {isFlipped && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <Button 
                    variant="outline" 
                    onClick={handleRevisar}
                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    <span className="text-sm">Revisar</span>
                  </Button>
                  <Button 
                    onClick={handleConhecido}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    <span className="text-sm">Conheço</span>
                  </Button>
                </motion.div>
              )}

              {/* Stats - Minimalistas */}
              <div className="mt-3 flex justify-center items-center gap-4 text-xs text-muted-foreground">
                <span>Sessão: {sessionStats.correct}/{sessionStats.total}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  {sessionStats.total > 0 ? Math.round(sessionStats.correct / sessionStats.total * 100) : 0}%
                </span>
              </div>
            </div>
          </motion.div>}

        {(viewMode === 'estudo' || viewMode === 'review') && !loading && flashcardsFiltrados.length === 0 && <motion.div key="no-cards" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="container mx-auto px-4 py-20 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum card encontrado</h2>
            <p className="text-muted-foreground mb-6">
              {viewMode === 'review' ? 'Você não tem cards para revisar no momento.' : 'Não há cards disponíveis para os critérios selecionados.'}
            </p>
            <Button onClick={voltarParaDashboard}>
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </motion.div>}
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
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
      `
    }} />
    </div>;
};
export default FlashcardsModern;