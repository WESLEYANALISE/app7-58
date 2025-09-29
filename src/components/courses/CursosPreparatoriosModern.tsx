import { useState } from 'react';
import { useCursosOrganizados, useProgressoUsuario, CursoArea, CursoModulo, CursoAula } from '@/hooks/useCursosPreparatorios';
import { ModernCourseLayout } from './layouts/ModernCourseLayout';
import { CourseAreaCard } from './cards/CourseAreaCard';
import { CourseModuleCard } from './cards/CourseModuleCard';
import { CourseLessonCard } from './cards/CourseLessonCard';
import { SimpleVideoPlayer } from './players/SimpleVideoPlayer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LessonActionButtons } from '../Cursos/LessonActionButtons';
import ProfessoraIA from '../ProfessoraIA';
import { ProfessoraIAFloatingButton } from '../ProfessoraIAFloatingButton';

interface CursosPreparatoriosModernProps {
  onBack: () => void;
}

export const CursosPreparatoriosModern = ({ onBack }: CursosPreparatoriosModernProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<CursoArea | null>(null);
  const [selectedModulo, setSelectedModulo] = useState<CursoModulo | null>(null);
  const [selectedAula, setSelectedAula] = useState<CursoAula | null>(null);
  const [showProfessora, setShowProfessora] = useState(false);

  const {
    areas,
    totalAreas,
    totalModulos,
    totalAulas,
    isLoading,
    error
  } = useCursosOrganizados();

  const {
    atualizarProgresso,
    obterProgresso,
    calcularProgressoModulo,
    calcularProgressoArea
  } = useProgressoUsuario();

  const handleLocalBack = () => {
    if (selectedAula) {
      setSelectedAula(null);
    } else if (selectedModulo) {
      setSelectedModulo(null);
    } else if (selectedArea) {
      setSelectedArea(null);
    } else {
      onBack();
    }
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (selectedAula) {
      atualizarProgresso(selectedAula.id, currentTime, duration);
    }
  };

  const handleVideoEnd = () => {
    if (selectedAula && selectedModulo) {
      const currentAulaIndex = selectedModulo.aulas.findIndex(a => a.id === selectedAula.id);
      const nextAula = selectedModulo.aulas[currentAulaIndex + 1];
      if (nextAula) {
        setSelectedAula(nextAula);
      } else {
        setSelectedAula(null);
      }
    }
  };

  const filteredAreas = areas.filter(area => 
    area.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    area.modulos.some(modulo => 
      modulo.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      modulo.aulas.some(aula => 
        aula.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aula.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aula.assunto.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  if (isLoading) {
    return (
      <ModernCourseLayout
        title="Cursos Preparatórios"
        onBack={handleLocalBack}
        showSearch={false}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando cursos...</p>
          </div>
        </div>
      </ModernCourseLayout>
    );
  }

  if (error) {
    return (
      <ModernCourseLayout
        title="Cursos Preparatórios"
        onBack={handleLocalBack}
        showSearch={false}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertDescription>
              Erro ao carregar cursos. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </div>
      </ModernCourseLayout>
    );
  }

  // Visualização da aula
  if (selectedAula) {
    const progresso = obterProgresso(selectedAula.id);
    
    return (
      <ModernCourseLayout
        title={selectedAula.nome}
        onBack={handleLocalBack}
        showSearch={false}
      >
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player */}
            <SimpleVideoPlayer
              videoUrl={selectedAula.video}
              title={selectedAula.nome}
              subtitle={`${selectedAula.area} • ${selectedAula.tema}`}
              onProgress={handleVideoProgress}
              initialTime={progresso?.tempoAssistido || 0}
              onEnded={handleVideoEnd}
              autoPlay={true}
            />

            {/* Action Buttons - Logo abaixo do vídeo */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="text-base font-semibold mb-3 text-foreground">Ferramentas de Estudo</h3>
              <LessonActionButtons lesson={{
                id: selectedAula.id,
                area: selectedAula.area,
                tema: selectedAula.tema,
                assunto: selectedAula.nome,
                conteudo: selectedAula.conteudo || ''
              }} />
            </div>

            {/* Lesson Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline">
                      {selectedAula.area} - {selectedModulo?.nome}
                    </Badge>
                    <h1 className="text-2xl font-bold">{selectedAula.nome}</h1>
                    <p className="text-lg text-muted-foreground">{selectedAula.tema}</p>
                  </div>
                </div>

                {progresso && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso da aula</span>
                      <span className="text-sm text-muted-foreground">{progresso.percentualAssistido}%</span>
                    </div>
                    <Progress value={progresso.percentualAssistido} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lesson Content */}
            {selectedAula.conteudo && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Conteúdo da Aula</h2>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-yellow-500 prose-strong:font-bold prose-li:text-muted-foreground prose-ul:space-y-2 prose-ol:space-y-2">
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => <strong className="text-yellow-500 font-bold">{children}</strong>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="space-y-2 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="space-y-2 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
                      }}
                    >
                      {selectedAula.conteudo}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
          
          <ProfessoraIA 
            video={{
              title: selectedAula.nome,
              area: selectedAula.area,
              channelTitle: 'Cursos Preparatórios'
            }} 
            isOpen={showProfessora} 
            onClose={() => setShowProfessora(false)} 
          />
        </ModernCourseLayout>
    );
  }

  // Visualização do módulo
  if (selectedModulo) {
    const progressoModulo = calcularProgressoModulo(selectedModulo.aulas);
    
    return (
      <ModernCourseLayout
        title={selectedModulo.nome}
        onBack={handleLocalBack}
        showSearch={false}
      >
        <div className="space-y-6">
          {/* Module Header */}
          <Card>
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={selectedModulo.capa || '/placeholder.svg'} 
                alt={selectedModulo.nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white">{selectedModulo.nome}</h1>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedModulo.aulas.length} aulas</span>
                  <span>{selectedModulo.totalDuracao} min</span>
                  <span>{progressoModulo}% concluído</span>
                </div>
                <Progress value={progressoModulo} className="w-32 h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Lessons List */}
          <div className="space-y-3">
            {selectedModulo.aulas.map((aula, index) => {
              const progresso = obterProgresso(aula.id);
              return (
                <CourseLessonCard
                  key={aula.id}
                  aula={aula}
                  lessonNumber={index + 1}
                  progress={progresso?.percentualAssistido || 0}
                  isCompleted={progresso?.concluida || false}
                  isWatched={progresso && progresso.percentualAssistido > 0}
                  onClick={() => setSelectedAula(aula)}
                />
              );
            })}
          </div>
        </div>
        </ModernCourseLayout>
    );
  }

  // Visualização da área
  if (selectedArea) {
    const progressoArea = calcularProgressoArea(selectedArea);
    
    return (
      <ModernCourseLayout
        title={selectedArea.nome}
        onBack={handleLocalBack}
        showSearch={false}
      >
        <div className="space-y-6">
          {/* Area Header */}
          <Card>
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={selectedArea.capa || '/placeholder.svg'} 
                alt={selectedArea.nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white">{selectedArea.nome}</h1>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedArea.modulos.length} módulos</span>
                  <span>{selectedArea.totalAulas} aulas</span>
                  <span>{progressoArea}% concluído</span>
                </div>
                <Progress value={progressoArea} className="w-32 h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Modules Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {selectedArea.modulos.map((modulo, index) => {
              const progressoModulo = calcularProgressoModulo(modulo.aulas);
              return (
                <CourseModuleCard
                  key={`${modulo.nome}-${index}`}
                  modulo={modulo}
                  progress={progressoModulo}
                  onClick={() => setSelectedModulo(modulo)}
                  isCompleted={progressoModulo >= 100}
                />
              );
            })}
          </div>
        </div>
      </ModernCourseLayout>
    );
  }

  // Visualização principal - lista de áreas
  return (
    <ModernCourseLayout
      title="Cursos Preparatórios"
      onBack={handleLocalBack}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      stats={{
        totalAreas,
        totalModulos,
        totalAulas
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAreas.map((area, index) => {
          const progressoArea = calcularProgressoArea(area);
          return (
            <CourseAreaCard
              key={`${area.nome}-${index}`}
              area={area}
              progress={progressoArea}
              onClick={() => setSelectedArea(area)}
            />
          );
        })}
      </div>

      {filteredAreas.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum curso encontrado para "{searchTerm}"
          </p>
        </div>
      )}
    </ModernCourseLayout>
  );
};