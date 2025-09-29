import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, BookOpen, Clock, ChevronRight, PlayCircle, TrendingUp } from 'lucide-react';
import { useCursosOrganizados, useProgressoUsuario, CursoArea, CursoModulo, CursoAula } from '@/hooks/useCursosPreparatorios';
import { useCursosCoversPreloader } from '@/hooks/useCoverPreloader';
import { CursosVideoPlayerOptimized } from '@/components/CursosVideoPlayerOptimized';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import ProfessoraIA from '../ProfessoraIA';
import { ProfessoraIAFloatingButton } from '../ProfessoraIAFloatingButton';
import { CourseCard } from './CourseCard';
import { LessonCard } from './LessonCard';
import { LessonActionButtons } from './LessonActionButtons';

interface CursoIniciandoProps {
  onBack: () => void;
}

export const CursoIniciando = ({ onBack }: CursoIniciandoProps) => {
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

  useCursosCoversPreloader(areas);

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

  const handleNearVideoEnd = () => {
    if (selectedAula) {
      const durationInSeconds = selectedAula.duracao * 60;
      atualizarProgresso(selectedAula.id, durationInSeconds, durationInSeconds);
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
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Iniciando no Direito</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Iniciando no Direito</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar cursos</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  // Visualização de aula individual
  if (selectedAula) {
    const progresso = obterProgresso(selectedAula.id);
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <div className="ml-4 flex-1">
              <Badge variant="outline" className="mr-2">
                {selectedAula.area} - {selectedModulo?.nome}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {/* Player de Vídeo Otimizado */}
          <div className="mb-6 -mx-4 sm:mx-0">
            <CursosVideoPlayerOptimized 
              videoUrl={selectedAula.video} 
              title={selectedAula.nome} 
              subtitle={`${selectedAula.area} • ${selectedAula.tema}`}
              onProgress={handleVideoProgress}
              initialTime={progresso?.tempoAssistido || 0}
              onEnded={handleVideoEnd}
              onNearEnd={handleNearVideoEnd}
              autoPlay={true}
              lesson={{
                id: selectedAula.id,
                area: selectedAula.area,
                tema: selectedAula.tema,
                assunto: selectedAula.nome,
                conteudo: selectedAula.conteudo
              }}
            />
          </div>

          {/* Informações da Aula */}
          <div className="bg-card rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{selectedAula.nome}</h1>
            <p className="text-lg text-muted-foreground mb-4">{selectedAula.tema}</p>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedAula.duracao}min</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{progresso?.percentualAssistido || 0}% assistido</span>
              </div>
            </div>

            {progresso && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso da aula</span>
                  <span className="text-sm text-muted-foreground">{progresso.percentualAssistido}%</span>
                </div>
                <Progress value={progresso.percentualAssistido} className="h-2" />
              </div>
            )}
          </div>

          {/* Conteúdo da Aula */}
          {selectedAula.conteudo && (
            <div className="bg-card rounded-lg p-6 mb-6">
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
            </div>
          )}

          <LessonActionButtons lesson={{
            id: selectedAula.id,
            area: selectedAula.area,
            tema: selectedAula.tema,
            assunto: selectedAula.nome,
            conteudo: selectedAula.conteudo || ''
          }} />
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
      </div>
    );
  }

  // Visualização de módulo com suas aulas
  if (selectedModulo) {
    const progressoModulo = calcularProgressoModulo(selectedModulo.aulas);
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedModulo.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header do Módulo */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img 
                src={selectedModulo.capa || '/placeholder.svg'} 
                alt={selectedModulo.nome} 
                className="w-full h-full object-cover" 
                loading="eager" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedModulo.nome}</h1>
              </div>
            </div>
            
            <div className="bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-base">
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                    <PlayCircle className="w-4 h-4" />
                    <span className="font-semibold">{selectedModulo.aulas.length} aulas</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{selectedModulo.totalDuracao} min</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">{progressoModulo}%</span>
                  </div>
                </div>
                <div className="w-32 bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary rounded-full h-2.5 transition-all duration-300" 
                    style={{ width: `${progressoModulo}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Aulas Otimizada */}
          <div className="space-y-3">
            {selectedModulo.aulas.map((aula, index) => {
              const progresso = obterProgresso(aula.id);
              return (
                <LessonCard
                  key={aula.id}
                  title={aula.nome}
                  subtitle={aula.tema}
                  image={aula.capa}
                  duration={aula.duracao}
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
      </div>
    );
  }

  // Visualização de área com seus módulos
  if (selectedArea) {
    const progressoArea = calcularProgressoArea(selectedArea);
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedArea.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header da Área */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img 
                src={selectedArea.capa || '/placeholder.svg'} 
                alt={selectedArea.nome} 
                className="w-full h-full object-cover" 
                loading="eager" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedArea.nome}</h1>
              </div>
            </div>
            
            <div className="bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-base">
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold">{selectedArea.modulos.length} módulos</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                    <PlayCircle className="w-4 h-4" />
                    <span className="font-semibold">{selectedArea.totalAulas} aulas</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">{progressoArea}%</span>
                  </div>
                </div>
                <div className="w-32 bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary rounded-full h-2.5 transition-all duration-300" 
                    style={{ width: `${progressoArea}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Módulos */}
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {selectedArea.modulos.map((modulo, index) => {
              const progressoModulo = calcularProgressoModulo(modulo.aulas);
              return (
                <div 
                  key={`${modulo.nome}-${index}`} 
                  className="group cursor-pointer"
                  onClick={() => setSelectedModulo(modulo)}
                >
                  <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="relative h-52">
                      <img 
                        src={modulo.capa || '/placeholder.svg'} 
                        alt={modulo.nome} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        loading="eager" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight">{modulo.nome}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-white/90 text-sm">
                            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                              <PlayCircle className="w-4 h-4" />
                              <span className="font-medium">{modulo.aulas.length}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{modulo.totalDuracao}min</span>
                            </div>
                          </div>
                          <div className="bg-primary/90 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            {progressoModulo}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-semibold text-muted-foreground">Progresso do Módulo</span>
                        <span className="text-base font-bold text-primary">{progressoModulo}%</span>
                      </div>
                      <Progress value={progressoModulo} className="h-3" />
                      
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{modulo.aulas.length} aulas • {modulo.totalDuracao} minutos</span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Lista principal de áreas
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Iniciando no Direito</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Header com Estatísticas */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">{totalAreas} áreas</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border">
                <PlayCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">{totalModulos} módulos</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border">
                <Play className="h-4 w-4 text-primary" />
                <span className="font-medium">{totalAulas} aulas</span>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar áreas, módulos ou aulas..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </div>

        {/* Lista de Áreas */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAreas.map((area, index) => {
            const progressoArea = calcularProgressoArea(area);
            return (
              <div 
                key={`${area.nome}-${index}`} 
                className="group cursor-pointer"
                onClick={() => setSelectedArea(area)}
              >
                <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10" >
                  <div className="relative h-56">
                    <img 
                      src={area.capa || '/placeholder.svg'} 
                      alt={area.nome} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      loading="eager" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight">{area.nome}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-medium">{area.modulos.length}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                            <PlayCircle className="w-4 h-4" />
                            <span className="font-medium">{area.totalAulas}</span>
                          </div>
                        </div>
                        <div className="bg-primary/90 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                          {progressoArea}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-muted-foreground">Progresso do Curso</span>
                      <span className="text-base font-bold text-primary">{progressoArea}%</span>
                    </div>
                    <Progress value={progressoArea} className="h-3" />
                    
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{area.modulos.length} módulos disponíveis</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};