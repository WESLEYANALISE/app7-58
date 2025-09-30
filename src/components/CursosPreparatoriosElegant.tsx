import { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, Pause, Search, BarChart3, Download, BookOpen, Clock, CheckCircle, PlayCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ReactMarkdown from 'react-markdown';
import { useCursosOrganizados, useProgressoUsuario } from '@/hooks/useCursosPreparatorios';
import { normalizeVideoUrl } from '@/utils/videoHelpers';
import { LessonActionButtons } from '@/components/Cursos/LessonActionButtons';
import { toast } from 'sonner';
import professoraAvatar from '@/assets/professora-avatar.png';
import { ProfessoraChat } from '@/components/ProfessoraChat';
import { motion } from 'framer-motion';
import { optimizeCourseImage, preloadCourseImages } from '@/utils/courseOptimization';
import { useCursosCoversPreloader } from '@/hooks/useCoverPreloader';
import { OptimizedImage } from '@/components/OptimizedImage';
interface CursosPreparatoriosElegantProps {
  onBack: () => void;
}
export function CursosPreparatoriosElegant({
  onBack
}: CursosPreparatoriosElegantProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'areas' | 'modules' | 'lessons' | 'player'>('areas');
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProfessorOpen, setIsProfessorOpen] = useState(false);
  const {
    areas,
    totalAreas,
    totalModulos,
    totalAulas,
    isLoading
  } = useCursosOrganizados();
  const {
    atualizarProgresso,
    obterProgresso,
    calcularProgressoModulo,
    calcularProgressoArea
  } = useProgressoUsuario();

  // Preload course covers for ultra-fast loading
  useCursosCoversPreloader(areas);

  // Memoize optimized image URLs
  const optimizedAreas = useMemo(() => {
    return areas.map(area => ({
      ...area,
      capa: optimizeCourseImage(area.capa),
      modulos: area.modulos.map(module => ({
        ...module,
        capa: optimizeCourseImage(module.capa)
      }))
    }));
  }, [areas]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  // Video player setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedLesson) return;
    console.log('🎬 Setting up video for lesson:', selectedLesson.nome);
    const normalizedUrl = normalizeVideoUrl(selectedLesson.video);
    console.log('🎥 Video URL:', normalizedUrl);

    // Reset video state
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    const handleLoadedMetadata = () => {
      console.log('📊 Video metadata loaded, duration:', video.duration);
      setDuration(video.duration || 0);
    };
    const handleLoadedData = () => {
      console.log('📊 Video data loaded, attempting autoplay...');
      video.play().then(() => {
        console.log('✅ Autoplay successful');
        setPlaying(true);
      }).catch(error => {
        console.warn('⚠️ AutoPlay blocked:', error);
        toast.info('Clique no play para iniciar o vídeo');
      });
    };
    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const dur = video.duration || 0;
      setCurrentTime(current);
      if (dur > 0) {
        atualizarProgresso(selectedLesson.id, current, dur);
      }
    };
    const handlePlay = () => {
      setPlaying(true);
      setShowControls(false); // Hide controls when playing
    };
    const handlePause = () => {
      setPlaying(false);
      setShowControls(true); // Show controls when paused
    };
    const handleEnded = () => {
      setPlaying(false);
      // Auto-advance to next lesson
      if (selectedModule) {
        const currentIndex = selectedModule.aulas.findIndex((a: any) => a.id === selectedLesson.id);
        const nextLesson = selectedModule.aulas[currentIndex + 1];
        if (nextLesson) {
          setSelectedLesson(nextLesson);
        }
      }
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Set video source and load
    video.src = normalizedUrl;
    video.load();
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [selectedLesson?.id, selectedModule]);
  const handleBack = () => {
    if (currentView === 'player') {
      setCurrentView('lessons');
    } else if (currentView === 'lessons') {
      setCurrentView('modules');
    } else if (currentView === 'modules') {
      setCurrentView('areas');
    } else {
      onBack();
    }
  };
  const handleSelectArea = (area: any) => {
    setSelectedArea(area);
    setCurrentView('modules');
  };
  const handleSelectModule = (module: any) => {
    setSelectedModule(module);
    setCurrentView('lessons');
  };
  const handleSelectLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setCurrentView('player');
  };
  const handleSeek = (percentage: number) => {
    const video = videoRef.current;
    if (video && duration) {
      const newTime = percentage / 100 * duration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (playing) {
        video.pause();
      } else {
        video.play().catch(console.error);
      }
    }
  };

  // Handle user interaction with video
  const handleVideoClick = () => {
    togglePlayPause();
    if (playing) {
      setShowControls(true);
      // Hide controls after 3 seconds of no interaction
      setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  const handleMouseMove = () => {
    if (playing) {
      setShowControls(true);
      setIsUserInteracting(true);
      // Hide controls after 3 seconds of no mouse movement
      setTimeout(() => {
        setShowControls(false);
        setIsUserInteracting(false);
      }, 3000);
    }
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cursos...</p>
        </div>
      </div>;
  }

  // Video Player View
  if (currentView === 'player' && selectedLesson) {
    const progress = obterProgresso(selectedLesson.id);
    const progressPercentage = duration > 0 ? currentTime / duration * 100 : 0;
    return <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2 text-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
          <div className="w-20"></div>
        </div>

        {/* Video Container */}
        <div className="relative">
          <video ref={videoRef} className="w-full h-auto max-h-[70vh] object-contain bg-black cursor-pointer" playsInline muted={false} controls={false} preload="auto" onClick={handleVideoClick} onMouseMove={handleMouseMove} />
          
          {/* Progress bar at bottom with percentage */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/50">
            <div className="h-full bg-primary transition-all duration-300" style={{
            width: `${progressPercentage}%`
          }} />
            <div className="absolute -top-6 right-2 text-xs px-2 py-1 rounded-md bg-background/80 text-foreground border border-border">
              {Math.round(progressPercentage)}%
            </div>
          </div>

          {/* Video Overlay - Only show when paused or controls are visible */}
          {(showControls || !playing) && <div onClick={togglePlayPause} className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300">
              {/* Central play/pause button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={e => {
              e.stopPropagation();
              togglePlayPause();
            }} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center transition-all duration-200 hover:scale-110">
                  {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </button>
              </div>
              
              {/* Bottom overlay with lesson info */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="space-y-4">
                  <div>
                    
                    <p className="text-lg text-muted-foreground">{selectedLesson.nome}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary text-primary-foreground font-medium px-3 py-1">
                      Dia {selectedLesson.id} - Aula {selectedModule.aulas.findIndex((a: any) => a.id === selectedLesson.id) + 1}
                    </Badge>
                    <Badge variant="outline" className="border-border text-foreground">
                      {selectedModule.nome}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{selectedLesson.duracao}min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{progress?.percentualAssistido || 0}% assistido</span>
                    </div>
                  </div>

                  {/* Interactive Progress Controls */}
                  <div className="space-y-2">
                    
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                      <span>Progresso da aula: {Math.round(progressPercentage)}%</span>
                      <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted/20 px-2 py-1 text-xs">
                        <span>1x</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

          {/* Loading indicator */}
          {!playing && currentTime === 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm">Carregando vídeo...</p>
              </div>
            </div>}
        </div>

        {/* Action Buttons - Logo abaixo do vídeo */}
        <div className="p-6 px-[7px]">
          <div className="bg-card rounded-lg p-4 border border-border">
            <h3 className="text-base font-semibold mb-3 text-primary">Ferramentas de Estudo</h3>
            <LessonActionButtons lesson={{
            id: selectedLesson.id,
            area: selectedLesson.area,
            tema: selectedLesson.tema,
            assunto: selectedLesson.nome,
            conteudo: selectedLesson.conteudo || ''
          }} />
          </div>
        </div>

        {/* Lesson Content */}
        <div className="pb-6 space-y-6 px-[7px]">
          {selectedLesson.conteudo && <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary">Conteúdo da Aula</h3>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-strong:text-primary prose-p:text-muted-foreground prose-li:text-muted-foreground">
                <ReactMarkdown components={{
              h1: ({
                children
              }) => <h1 className="text-xl font-bold mb-4 text-primary">{children}</h1>,
              h2: ({
                children
              }) => <h2 className="text-lg font-bold mb-3 text-primary">{children}</h2>,
              h3: ({
                children
              }) => <h3 className="text-base font-bold mb-2 text-primary">{children}</h3>,
              strong: ({
                children
              }) => <strong className="text-primary font-bold">{children}</strong>,
              p: ({
                children
              }) => <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>,
              ul: ({
                children
              }) => <ul className="space-y-2 ml-4 text-muted-foreground">{children}</ul>,
              ol: ({
                children
              }) => <ol className="space-y-2 ml-4 text-muted-foreground">{children}</ol>,
              li: ({
                children
              }) => <li className="leading-relaxed">{children}</li>
            }}>
                  {selectedLesson.conteudo}
                </ReactMarkdown>
              </div>
            </div>}
        </div>

        {/* Floating Professor Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button variant="ghost" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-16 h-16 shadow-lg border-4 border-background" onClick={() => setIsProfessorOpen(true)} aria-label="Abrir chat da Professora">
              <img src={professoraAvatar} alt="Professora" className="w-full h-full rounded-full object-cover" />
            </Button>
            
            {/* Chat indicator */}
            <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
              <MessageCircle className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Professora Chat */}
        <ProfessoraChat isOpen={isProfessorOpen} onClose={() => setIsProfessorOpen(false)} context={{
        titulo: selectedLesson.nome,
        area: selectedLesson.area,
        sobre: selectedLesson.conteudo || ''
      }} />
      </div>;
  }

  // Lessons List View
  if (currentView === 'lessons' && selectedModule) {
    return <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2 text-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
          <Button variant="ghost" size="sm" className="text-foreground">
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>

        {/* Course Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Curso Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-xl font-bold">{selectedModule.nome}</h2>
              <p className="text-muted-foreground">
                {selectedModule.aulas.length} de {selectedModule.aulas.length} aulas concluídas
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold">{calcularProgressoModulo(selectedModule.aulas)}%</span>
          </div>
        </div>

        {/* Lessons List */}
        <motion.div 
          className="space-y-4 px-[16px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {selectedModule.aulas.map((lesson: any, index: number) => {
          const progress = obterProgresso(lesson.id);
          const optimizedCapa = optimizeCourseImage(lesson.capa);
            return <motion.div key={lesson.id} variants={itemVariants} className="animate-fade-in">
              <Card className="bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectLesson(lesson)}>
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Lesson Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 rounded-t-lg">
                      {optimizedCapa && (
                        <OptimizedImage 
                          src={optimizedCapa} 
                          alt={lesson.nome} 
                          className="w-full h-full rounded-t-lg"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Button variant="ghost" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-16 h-16">
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="w-full h-1 bg-muted/50 rounded-full">
                          <div className="h-full bg-primary rounded-full" style={{
                        width: `${progress?.percentualAssistido || 0}%`
                      }} />
                        </div>
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground font-medium">
                          Aula {index + 1}
                        </Badge>
                        <Badge variant="outline" className="border-primary text-primary">
                          {selectedModule.nome}
                        </Badge>
                        
                      </div>

                      <h3 className="text-lg font-bold">{lesson.nome}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {lesson.tema}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duracao}min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          <span>{progress?.percentualAssistido || 0}% assistido</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>;
        })}
        </motion.div>
      </div>;
  }

  // Modules List View
  if (currentView === 'modules' && selectedArea) {
    return <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2 text-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
          <div className="w-20"></div>
        </div>

        {/* Area Header */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Curso Pro</span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-xl font-bold">{selectedArea.nome}</h2>
              <p className="text-muted-foreground">{selectedArea.modulos.length} módulos disponíveis</p>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <motion.div 
          className="px-6 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {selectedArea.modulos.map((module: any, index: number) => {
          const moduleProgress = calcularProgressoModulo(module.aulas);
          const completedLessons = module.aulas.filter((lesson: any) => {
            const progress = obterProgresso(lesson.id);
            return progress?.concluida;
          }).length;
          const optimizedCapa = optimizeCourseImage(module.capa);
              return <motion.div key={index} variants={itemVariants} className="animate-fade-in">
                <Card className="bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectModule(module)}>
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Module Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 rounded-t-lg">
                      {optimizedCapa && (
                        <OptimizedImage 
                          src={optimizedCapa} 
                          alt={module.nome} 
                          className="w-full h-full rounded-t-lg"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-secondary text-secondary-foreground font-medium">
                          Novo
                        </Badge>
                      </div>
                    </div>

                    {/* Module Info */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold">{module.nome}</h3>
                      <p className="text-muted-foreground">
                        Fundamentos jurídicos e princípios básicos
                      </p>
                      
                      <Badge variant="outline" className="border-primary text-primary">
                        {selectedArea.nome}
                      </Badge>

                      <div className="flex items-center justify-around text-center">
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-2xl font-bold text-primary">{module.aulas.length}</div>
                          <div className="text-sm text-muted-foreground">Aulas</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-2xl font-bold text-primary">{module.totalDuracao}min</div>
                          <div className="text-sm text-muted-foreground">Duração</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <CheckCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-2xl font-bold text-primary">{completedLessons}</div>
                          <div className="text-sm text-muted-foreground">Feitas</div>
                        </div>
                      </div>

                      <Progress value={moduleProgress} />
                      <div className="text-right text-sm text-muted-foreground mt-2">{moduleProgress}% concluído</div>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                        Começar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>;
        })}
        </motion.div>
      </div>;
  }

  // Areas List View (Main)
  return <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2 text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar</span>
        </Button>
        <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
        <div className="w-20"></div>
      </div>

      {/* Course Pro Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Buscar aulas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <Button variant="ghost" size="sm" className="text-foreground">
              <BarChart3 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium">
            ● Escolha sua Área de Estudo
          </div>
          <h2 className="text-2xl font-bold">Áreas de Conhecimento Jurídico</h2>
          <p className="text-muted-foreground">
            Selecione uma área para explorar os módulos e aulas especializadas
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around text-center animate-fade-in">
          <div>
            <div className="text-3xl font-bold text-primary">{totalAreas}</div>
            <div className="text-sm text-muted-foreground">Áreas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{totalModulos}</div>
            <div className="text-sm text-muted-foreground">Módulos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{totalAulas}</div>
            <div className="text-sm text-muted-foreground">Aulas</div>
          </div>
        </div>
      </div>

      {/* Areas List */}
      <motion.div 
        className="px-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {optimizedAreas.map((area, index) => {
        const areaProgress = calcularProgressoArea(area);
        const completedLessons = area.modulos.reduce((total, module) => {
          return total + module.aulas.filter(lesson => {
            const progress = obterProgresso(lesson.id);
            return progress?.concluida;
          }).length;
        }, 0);
        return <motion.div key={index} variants={itemVariants} className="animate-fade-in">
            <Card className="bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectArea(area)}>
              <CardContent className="p-0">
                <div className="relative">
                  {/* Area Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary to-primary/80 rounded-t-lg">
                    {area.capa && (
                      <OptimizedImage 
                        src={area.capa} 
                        alt={area.nome} 
                        className="w-full h-full rounded-t-lg"
                        loading="eager"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Area Info */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">{area.nome}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{area.modulos.length} módulos</span>
                      <span>•</span>
                      <span>{area.totalAulas} aulas</span>
                    </div>

                    <div className="flex items-center justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{completedLessons}</div>
                        <div className="text-sm text-muted-foreground">Concluídas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{area.totalAulas - completedLessons}</div>
                        <div className="text-sm text-muted-foreground">Pendentes</div>
                      </div>
                    </div>

                    <Progress value={areaProgress} />
                    <div className="text-right text-sm text-muted-foreground mt-2">{areaProgress}% concluído</div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                      📝 Começar Agora
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>;
      })}
      </motion.div>
    </div>;
};

export default CursosPreparatoriosElegant;