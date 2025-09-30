import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Search, 
  PlayCircle, 
  BookOpen, 
  Grid3x3, 
  List,
  Sparkles,
  FileText
} from 'lucide-react';
import { useCursosOrganizados } from '@/hooks/useCursosPreparatorios';
import { useCoverPreloader } from '@/hooks/useCoverPreloader';
import { useStaggerAnimation } from '@/hooks/useCourseAnimations';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedCoursePlayer } from './EnhancedCoursePlayer';
import { CourseProgressBar } from './CourseProgressBar';
import { CourseFlashcardsGenerator } from './CourseFlashcardsGenerator';
import { CoursePDFExporter } from './CoursePDFExporter';
import { optimizeCourseImage } from '@/utils/courseOptimization';

interface CursosPreparatoriosUltraModernProps {
  onBack: () => void;
}

export const CursosPreparatoriosUltraModern = ({ onBack }: CursosPreparatoriosUltraModernProps) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFlashcards, setShowFlashcards] = useState(false);

  const { areas, isLoading } = useCursosOrganizados();
  const { calculateModuleProgress, getProgress } = useVideoProgress();
  const getStaggerAnimation = useStaggerAnimation(areas.length);

  // Preload covers
  const coverUrls = areas.flatMap(area => 
    area.modulos.flatMap(modulo => 
      modulo.aulas.map(aula => aula.capa).filter(Boolean)
    )
  );
  useCoverPreloader({ images: coverUrls, priority: 'high' });

  const currentArea = areas.find(a => a.nome === selectedArea);
  const currentModule = currentArea?.modulos.find(m => m.nome === selectedModule);

  // Mock flashcards - em produção, gerar via IA
  const mockFlashcards = selectedLesson ? [
    {
      id: '1',
      question: `Qual o conceito principal de ${selectedLesson.titulo}?`,
      answer: 'Resposta detalhada sobre o conceito abordado na aula.',
      example: 'Exemplo prático: aplicação real deste conceito em casos jurídicos.'
    },
    {
      id: '2',
      question: 'Quais são os pontos-chave desta aula?',
      answer: 'Os pontos principais incluem os fundamentos e aplicações práticas.',
      example: 'Exemplo: como este conhecimento é aplicado na prática jurídica.'
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-12 h-12 mx-auto text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  if (selectedLesson) {
    const progress = getProgress(selectedLesson.id.toString());
    
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedLesson(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para aulas
          </Button>

          <div className="mt-6 space-y-6">
            <EnhancedCoursePlayer
              videoUrl={selectedLesson.link}
              videoId={selectedLesson.id.toString()}
              title={selectedLesson.titulo}
              subtitle={selectedLesson.subtitulo}
            />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Material da Aula</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFlashcards(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Flashcards
                    </Button>
                    <CoursePDFExporter
                      courseTitle={selectedArea || ''}
                      moduleTitle={selectedModule || ''}
                      lessonTitle={selectedLesson.nome}
                      content={selectedLesson.conteudo || 'Conteúdo da aula'}
                      progress={progress?.percentage || 0}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {selectedLesson.conteudo || 'Descrição não disponível'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {showFlashcards && (
          <CourseFlashcardsGenerator
            flashcards={mockFlashcards}
            onClose={() => setShowFlashcards(false)}
          />
        )}
      </div>
    );
  }

  if (selectedModule && currentModule) {
    const videoIds = currentModule.aulas.map(a => a.id.toString());
    const moduleProgress = calculateModuleProgress(videoIds);
    const completedCount = videoIds.filter(id => {
      const p = getProgress(id);
      return p?.completed;
    }).length;

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setSelectedModule(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para módulos
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedModule}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {currentModule.aulas.length} aulas disponíveis
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {currentModule.totalDuracao}min
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CourseProgressBar
                completed={completedCount}
                total={currentModule.aulas.length}
                percentage={moduleProgress}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentModule.aulas.map((aula, index) => {
              const progress = getProgress(aula.id.toString());
              
              return (
                <motion.div
                  key={`${aula.id}-${index}`}
                  {...getStaggerAnimation(index)}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    onClick={() => setSelectedLesson(aula)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={optimizeCourseImage(aula.capa)}
                        alt={aula.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-16 h-16 text-white" />
                      </div>
                      {progress && progress.percentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2">{aula.nome}</h3>
                      {progress && (
                        <Badge variant="secondary" className="mt-2">
                          {progress.completed ? 'Concluída' : `${Math.round(progress.percentage)}%`}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (selectedArea && currentArea) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setSelectedArea(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para áreas
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{selectedArea}</CardTitle>
              <p className="text-muted-foreground">
                {currentArea.modulos.length} módulos • {currentArea.totalAulas} aulas
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-6">
            {currentArea.modulos.map((modulo, index) => {
              const videoIds = modulo.aulas.map(a => a.id.toString());
              const progress = calculateModuleProgress(videoIds);
              const completedCount = videoIds.filter(id => {
                const p = getProgress(id);
                return p?.completed;
              }).length;

              return (
                <motion.div
                  key={`modulo-${modulo.nome}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedModule(modulo.nome)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-xl font-bold">{modulo.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <PlayCircle className="w-4 h-4" />
                              {modulo.aulas.length} aulas
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {modulo.totalDuracao}min
                            </span>
                          </div>
                          <CourseProgressBar
                            completed={completedCount}
                            total={modulo.aulas.length}
                            percentage={progress}
                            showBadge={false}
                          />
                        </div>
                        <Badge variant={progress === 100 ? "default" : "secondary"}>
                          {Math.round(progress)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Lista de áreas
  const filteredAreas = areas.filter(area =>
    area.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Cursos Preparatórios</h1>
          <p className="text-muted-foreground">
            {areas.reduce((acc, area) => acc + area.totalAulas, 0)} aulas em{' '}
            {areas.length} áreas diferentes
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Separator />

        <motion.div
          className={`grid gap-6 ${
            viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          <AnimatePresence>
            {filteredAreas.map((area, index) => (
              <motion.div
                key={area.nome}
                {...getStaggerAnimation(index)}
              >
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  onClick={() => setSelectedArea(area.nome)}
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-24 h-24 text-primary/40" />
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {area.nome}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {area.modulos.length} módulos
                      </span>
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-4 h-4" />
                        {area.totalAulas} aulas
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
