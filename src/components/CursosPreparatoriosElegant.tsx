import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Search, BarChart3, Download, BookOpen, Clock, CheckCircle, PlayCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ReactMarkdown from 'react-markdown';
import { useCursosOrganizados, useProgressoUsuario } from '@/hooks/useCursosPreparatorios';
import { useOptimizedVideoPlayer } from '@/hooks/useOptimizedVideoPlayer';
import { normalizeVideoUrl } from '@/utils/videoHelpers';
import { LessonActionButtons } from '@/components/Cursos/LessonActionButtons';
import { toast } from 'sonner';
import professoraAvatar from '@/assets/professora-avatar.png';

interface CursosPreparatoriosElegantProps {
  onBack: () => void;
}

export const CursosPreparatoriosElegant = ({ onBack }: CursosPreparatoriosElegantProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'areas' | 'modules' | 'lessons' | 'player'>('areas');
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const { areas, totalAreas, totalModulos, totalAulas, isLoading } = useCursosOrganizados();
  const { atualizarProgresso, obterProgresso, calcularProgressoModulo, calcularProgressoArea } = useProgressoUsuario();

  const {
    playing,
    played,
    playedSeconds,
    duration,
    volume,
    muted,
    togglePlay,
    handleProgress: onVideoProgress,
    handleDuration,
    handleEnded,
    setVolume,
    toggleMute,
    seekTo,
    skipTime,
    formatTime,
    getProgressPercentage
  } = useOptimizedVideoPlayer({
    onProgress: (played: number, playedSeconds: number, duration: number) => {
      if (selectedLesson) {
        atualizarProgresso(selectedLesson.id, playedSeconds, duration);
      }
    },
    onEnded: () => {
      // Auto-advance to next lesson if available
      if (selectedModule && selectedLesson) {
        const currentIndex = selectedModule.aulas.findIndex((a: any) => a.id === selectedLesson.id);
        const nextLesson = selectedModule.aulas[currentIndex + 1];
        if (nextLesson) {
          setSelectedLesson(nextLesson);
        }
      }
    },
    autoPlay: true
  });

  // Auto-play video when lesson is selected
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedLesson) return;

    console.log('🎬 Initializing video for lesson:', selectedLesson.nome);
    
    const handleLoadedData = () => {
      console.log('📊 Video loaded, attempting autoplay...');
      video.play().then(() => {
        console.log('✅ Autoplay successful');
      }).catch((error) => {
        console.warn('⚠️ AutoPlay blocked:', error);
        toast.info('Clique no play para iniciar o vídeo');
      });
    };

    const handleLoadedMetadata = () => handleDuration(video.duration);
    const handleTimeUpdate = () => onVideoProgress({
      played: video.currentTime / video.duration,
      playedSeconds: video.currentTime,
      loaded: video.buffered.length > 0 ? video.buffered.end(0) / video.duration : 0
    });

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // Load the video
    video.src = normalizeVideoUrl(selectedLesson.video);
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [selectedLesson, handleDuration, onVideoProgress, handleEnded]);

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
      const newTime = (percentage / 100) * duration;
      video.currentTime = newTime;
      seekTo(newTime);
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
      togglePlay();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  // Video Player View
  if (currentView === 'player' && selectedLesson) {
    const progress = obterProgresso(selectedLesson.id);
    const progressPercentage = getProgressPercentage();

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
          <div className="w-20"></div>
        </div>

        {/* Video Container */}
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-[300px] object-cover bg-black"
            playsInline
            autoPlay
            muted={false}
            controls={false}
          />
          
          {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlayPause}
                className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full w-16 h-16"
              >
                {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </Button>
            </div>
            
            {/* Bottom overlay with lesson info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLesson.tema}</h2>
                  <p className="text-lg text-gray-300">{selectedLesson.nome}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge className="bg-yellow-500 text-black font-medium px-3 py-1">
                    Dia {selectedLesson.id} - Aula {selectedModule.aulas.findIndex((a: any) => a.id === selectedLesson.id) + 1}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white">
                    {selectedModule.nome}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedLesson.duracao}min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{progress?.percentualAssistido || 0}% assistido</span>
                  </div>
                </div>

                {/* Progress Controls */}
                <div className="space-y-2">
                  <div 
                    className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = (x / rect.width) * 100;
                      handleSeek(percentage);
                    }}
                  >
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <span>1x</span>
                      </Button>
                    </div>
                    <div className="text-sm text-gray-400">
                      Progresso da aula: {progress?.percentualAssistido || 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Logo abaixo do vídeo */}
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-base font-semibold mb-3 text-yellow-500">Ferramentas de Estudo</h3>
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
        <div className="px-6 pb-6 space-y-6">
          {selectedLesson.conteudo && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-yellow-500">Conteúdo da Aula</h3>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-yellow-500 prose-strong:text-yellow-400 prose-p:text-gray-300 prose-li:text-gray-300">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-yellow-500">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-3 text-yellow-500">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-yellow-500">{children}</h3>,
                    strong: ({ children }) => <strong className="text-yellow-400 font-bold">{children}</strong>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-300">{children}</p>,
                    ul: ({ children }) => <ul className="space-y-2 ml-4 text-gray-300">{children}</ul>,
                    ol: ({ children }) => <ol className="space-y-2 ml-4 text-gray-300">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  }}
                >
                  {selectedLesson.conteudo}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Floating Professor Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button
              variant="ghost"
              className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full w-16 h-16 shadow-lg border-4 border-white"
              onClick={() => toast.info(`Aula: ${selectedLesson.nome} - ${selectedLesson.tema}`)}
            >
              <img 
                src={professoraAvatar} 
                alt="Professora"
                className="w-full h-full rounded-full object-cover"
              />
            </Button>
            
            {/* Chat indicator */}
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              <MessageCircle className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lessons List View
  if (currentView === 'lessons' && selectedModule) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
          <Button variant="ghost" size="sm" className="text-white">
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>

        {/* Course Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-500">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Curso Pro</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white">
              <Search className="h-4 w-4 mr-2" />
              Buscar aulas...
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold">{selectedModule.nome}</h2>
              <p className="text-gray-400">
                {selectedModule.aulas.length} de {selectedModule.aulas.length} aulas concluídas
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold">{calcularProgressoModulo(selectedModule.aulas)}%</span>
          </div>
        </div>

        {/* Lessons List */}
        <div className="px-6 space-y-4">
          {selectedModule.aulas.map((lesson: any, index: number) => {
            const progress = obterProgresso(lesson.id);
            return (
              <Card 
                key={lesson.id}
                className="bg-gray-900 border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSelectLesson(lesson)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Lesson Image */}
                    <div className="relative h-48 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-t-lg">
                      {lesson.capa && (
                        <img 
                          src={lesson.capa} 
                          alt={lesson.nome}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="lg"
                          className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full w-16 h-16"
                        >
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="w-full h-1 bg-black/50 rounded-full">
                          <div 
                            className="h-full bg-yellow-500 rounded-full"
                            style={{ width: `${progress?.percentualAssistido || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 text-black font-medium">
                          Aula {index + 1}
                        </Badge>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                          {selectedModule.nome}
                        </Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          Em andamento
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold">{lesson.nome}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {lesson.tema}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
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
            );
          })}
        </div>
      </div>
    );
  }

  // Modules List View
  if (currentView === 'modules' && selectedArea) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
          <div className="w-20"></div>
        </div>

        {/* Area Header */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-500">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Curso Pro</span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold">{selectedArea.nome}</h2>
              <p className="text-gray-400">{selectedArea.modulos.length} módulos disponíveis</p>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="px-6 space-y-6">
          {selectedArea.modulos.map((module: any, index: number) => {
            const moduleProgress = calcularProgressoModulo(module.aulas);
            const completedLessons = module.aulas.filter((lesson: any) => {
              const progress = obterProgresso(lesson.id);
              return progress?.concluida;
            }).length;

            return (
              <Card 
                key={index}
                className="bg-gray-900 border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleSelectModule(module)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Module Image */}
                    <div className="relative h-48 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-t-lg">
                      {module.capa && (
                        <img 
                          src={module.capa} 
                          alt={module.nome}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 text-black font-medium">
                          Novo
                        </Badge>
                      </div>
                    </div>

                    {/* Module Info */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold">{module.nome}</h3>
                      <p className="text-gray-400">
                        Fundamentos jurídicos e princípios básicos
                      </p>
                      
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                        {selectedArea.nome}
                      </Badge>

                      <div className="flex items-center justify-around text-center">
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <BookOpen className="h-5 w-5 text-yellow-500" />
                          </div>
                          <div className="text-2xl font-bold text-yellow-500">{module.aulas.length}</div>
                          <div className="text-sm text-gray-400">Aulas</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Clock className="h-5 w-5 text-yellow-500" />
                          </div>
                          <div className="text-2xl font-bold text-yellow-500">{module.totalDuracao}min</div>
                          <div className="text-sm text-gray-400">Duração</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <CheckCircle className="h-5 w-5 text-yellow-500" />
                          </div>
                          <div className="text-2xl font-bold text-yellow-500">{completedLessons}</div>
                          <div className="text-sm text-gray-400">Feitas</div>
                        </div>
                      </div>

                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium">
                        Começar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Areas List View (Main)
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar</span>
        </Button>
        <h1 className="text-lg font-medium text-center flex-1">Cursos Preparatórios</h1>
        <div className="w-20"></div>
      </div>

      {/* Course Pro Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-500">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium text-lg">Curso Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar aulas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Button variant="ghost" size="sm" className="text-white">
              <BarChart3 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-full font-medium">
            ● Escolha sua Área de Estudo
          </div>
          <h2 className="text-2xl font-bold">Áreas de Conhecimento Jurídico</h2>
          <p className="text-gray-400">
            Selecione uma área para explorar os módulos e aulas especializadas
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around text-center">
          <div>
            <div className="text-3xl font-bold text-yellow-500">{totalAreas}</div>
            <div className="text-sm text-gray-400">Áreas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-500">{totalModulos}</div>
            <div className="text-sm text-gray-400">Módulos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-500">{totalAulas}</div>
            <div className="text-sm text-gray-400">Aulas</div>
          </div>
        </div>
      </div>

      {/* Areas List */}
      <div className="px-6 space-y-6">
        {areas.map((area, index) => {
          const areaProgress = calcularProgressoArea(area);
          const completedLessons = area.modulos.reduce((total, module) => {
            return total + module.aulas.filter((lesson) => {
              const progress = obterProgresso(lesson.id);
              return progress?.concluida;
            }).length;
          }, 0);

          return (
            <Card 
              key={index}
              className="bg-gray-900 border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => handleSelectArea(area)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  {/* Area Image */}
                  <div className="relative h-48 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-t-lg">
                    {area.capa && (
                      <img 
                        src={area.capa} 
                        alt={area.nome}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Area Info */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">{area.nome}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <span>{area.modulos.length} módulos</span>
                      <span>•</span>
                      <span>{area.totalAulas} aulas</span>
                    </div>

                    <div className="flex items-center justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">{completedLessons}</div>
                        <div className="text-sm text-gray-400">Concluídas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-500">{area.totalAulas - completedLessons}</div>
                        <div className="text-sm text-gray-400">Pendentes</div>
                      </div>
                    </div>

                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium">
                      📝 Começar Agora
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};