import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search, 
  Play, 
  BookOpen, 
  GraduationCap,
  FileText,
  Grid3x3,
  List,
  Sparkles
} from 'lucide-react';
import { useCursosOrganizados } from '@/hooks/useCursosPreparatorios';
import { useCoverPreloader } from '@/hooks/useCoverPreloader';
import { EnhancedCoursePlayer } from './EnhancedCoursePlayer';
import { CourseFlashcardsGenerator } from './CourseFlashcardsGenerator';
import { CoursePDFExporter } from './CoursePDFExporter';
import { CourseProgressBar } from './CourseProgressBar';
import { CourseAnimations } from './CourseAnimations';
import { useModuleProgress } from '@/hooks/useVideoProgress';
import { OptimizedImage } from '@/components/OptimizedImage';
import { staggerChildren } from '@/hooks/useCourseAnimations';

type ViewMode = 'areas' | 'modules' | 'lessons' | 'player' | 'flashcards';

interface CursosPreparatoriosUltraModernProps {
  onBack: () => void;
}

export const CursosPreparatoriosUltraModern = ({ onBack }: CursosPreparatoriosUltraModernProps) => {
  const { areas, isLoading } = useCursosOrganizados();
  
  const [viewMode, setViewMode] = useState<ViewMode>('areas');
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Pré-carregar todas as capas
  const allCovers = useMemo(() => {
    return areas.flatMap(area => 
      area.modulos.flatMap(modulo => 
        modulo.aulas.map(aula => aula.capa)
      )
    );
  }, [areas]);
  
  useCoverPreloader({ images: allCovers, priority: 'high' });

  // Filtrar áreas por busca
  const filteredAreas = useMemo(() => {
    if (!searchTerm) return areas;
    const term = searchTerm.toLowerCase();
    return areas.filter(area => 
      area.nome.toLowerCase().includes(term) ||
      area.modulos.some(modulo => 
        modulo.nome.toLowerCase().includes(term)
      )
    );
  }, [areas, searchTerm]);

  // Gerar flashcards automaticamente do conteúdo da aula
  const generateFlashcards = (lesson: any) => {
    // Simulação - em produção, usar IA para gerar
    return [
      {
        id: `${lesson.id}-1`,
        pergunta: `O que é ${lesson.titulo}?`,
        resposta: `${lesson.titulo} é um conceito fundamental em ${selectedArea?.nome || 'direito'}.`,
        exemplo: 'Exemplo prático aplicado ao caso concreto.'
      },
      {
        id: `${lesson.id}-2`,
        pergunta: `Qual a importância de ${lesson.titulo}?`,
        resposta: 'É essencial para compreender os fundamentos jurídicos aplicáveis.',
        exemplo: 'Casos práticos demonstram sua aplicação.'
      }
    ];
  };

  const handleAreaSelect = (area: any) => {
    setSelectedArea(area);
    setViewMode('modules');
    setSearchTerm('');
  };

  const handleModuleSelect = (modulo: any) => {
    setSelectedModule(modulo);
    setViewMode('lessons');
  };

  const handleLessonSelect = (aula: any) => {
    setSelectedLesson(aula);
    setViewMode('player');
  };

  const handleFlashcardsOpen = () => {
    setViewMode('flashcards');
  };

  const handleBack = () => {
    if (viewMode === 'flashcards') {
      setViewMode('player');
    } else if (viewMode === 'player') {
      setViewMode('lessons');
    } else if (viewMode === 'lessons') {
      setViewMode('modules');
      setSelectedModule(null);
    } else if (viewMode === 'modules') {
      setViewMode('areas');
      setSelectedArea(null);
    } else {
      onBack();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {/* ÁREAS */}
        {viewMode === 'areas' && (
          <motion.div
            key="areas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Cursos Preparatórios
              </h1>
              <div className="w-20" />
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar áreas ou módulos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAreas.map((area, index) => (
                <CourseAnimations key={area.nome} variant="fadeIn" delay={index * 0.1}>
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/40"
                    onClick={() => handleAreaSelect(area)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <Badge className="bg-primary">
                          {area.totalAulas} aulas
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2">{area.nome}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {area.modulos.length} módulos disponíveis
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Play className="h-4 w-4" />
                        <span>{area.totalAulas} videoaulas</span>
                      </div>
                    </CardContent>
                  </Card>
                </CourseAnimations>
              ))}
            </div>
          </motion.div>
        )}

        {/* MÓDULOS */}
        {viewMode === 'modules' && selectedArea && (
          <motion.div
            key="modules"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="container mx-auto px-4 py-6"
          >
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-bold">{selectedArea.nome}</h1>
              <div className="w-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedArea.modulos.map((modulo: any, index: number) => (
                <CourseAnimations key={`modulo-${modulo.nome}-${index}`} variant="slideLeft" delay={index * 0.1}>
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-card to-card/50"
                    onClick={() => handleModuleSelect(modulo)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          {modulo.aulas.length} aulas
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{modulo.nome}</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Duração estimada: {modulo.duracaoEstimada}
                      </p>
                      <CourseProgressBar 
                        percentage={0}
                        completedLessons={0}
                        totalLessons={modulo.aulas.length}
                      />
                    </CardContent>
                  </Card>
                </CourseAnimations>
              ))}
            </div>
          </motion.div>
        )}

        {/* AULAS */}
        {viewMode === 'lessons' && selectedModule && (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="container mx-auto px-4 py-6"
          >
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <h1 className="text-lg font-bold">{selectedModule.nome}</h1>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setLayoutMode('grid')}
                  className={layoutMode === 'grid' ? 'bg-primary/10' : ''}
                >
                  <Grid3x3 className="h-5 w-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setLayoutMode('list')}
                  className={layoutMode === 'list' ? 'bg-primary/10' : ''}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {selectedModule.aulas.map((aula: any, index: number) => (
                <motion.div
                  key={`aula-${aula.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-card to-card/50"
                    onClick={() => handleLessonSelect(aula)}
                  >
                    {aula.capa && (
                      <div className="aspect-video overflow-hidden">
                        <OptimizedImage
                          src={aula.capa}
                          alt={aula.titulo}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{aula.titulo}</h3>
                      {aula.subtitulo && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {aula.subtitulo}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Play className="h-4 w-4" />
                        <span>Assistir aula</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PLAYER */}
        {viewMode === 'player' && selectedLesson && (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="container mx-auto max-w-5xl px-4 py-6"
          >
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleFlashcardsOpen}
                  className="border-primary/30"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Flashcards
                </Button>
                <CoursePDFExporter
                  courseTitle={selectedArea?.nome || ''}
                  courseArea={selectedArea?.nome || ''}
                  moduleName={selectedModule?.nome}
                  lessonTitle={selectedLesson.titulo}
                  lessonContent={selectedLesson.subtitulo || 'Conteúdo da aula'}
                  progress={0}
                />
              </div>
            </div>

            <EnhancedCoursePlayer
              videoUrl={selectedLesson.link}
              videoId={selectedLesson.id.toString()}
              title={selectedLesson.titulo}
              subtitle={selectedLesson.subtitulo}
            />
          </motion.div>
        )}

        {/* FLASHCARDS */}
        {viewMode === 'flashcards' && selectedLesson && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <CourseFlashcardsGenerator
              flashcards={generateFlashcards(selectedLesson)}
              courseTitle={selectedLesson.titulo}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
