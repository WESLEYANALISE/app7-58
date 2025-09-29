import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, BookOpen, Clock, ChevronRight, PlayCircle, TrendingUp } from 'lucide-react';
import { useFaculdadeOrganizada, useProgressoFaculdade, SemestreFaculdade, ModuloFaculdade, TemaFaculdade, AulaFaculdadeCompleta } from '@/hooks/useCursoFaculdade';
import { CursosVideoPlayer } from '@/components/CursosVideoPlayer';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import ProfessoraIA from '../ProfessoraIA';
import { ProfessoraIAFloatingButton } from '../ProfessoraIAFloatingButton';
import { LessonActionButtons } from './LessonActionButtons';

interface CursoFaculdadeProps {
  onBack: () => void;
}

export const CursoFaculdade = ({ onBack }: CursoFaculdadeProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState<SemestreFaculdade | null>(null);
  const [selectedModulo, setSelectedModulo] = useState<ModuloFaculdade | null>(null);
  const [selectedTema, setSelectedTema] = useState<TemaFaculdade | null>(null);
  const [selectedAula, setSelectedAula] = useState<AulaFaculdadeCompleta | null>(null);
  const [showProfessora, setShowProfessora] = useState(false);

  const {
    semestres,
    totalSemestres,
    totalModulos,
    totalAulas,
    isLoading,
    error
  } = useFaculdadeOrganizada();

  const {
    atualizarProgresso,
    obterProgresso,
    calcularProgressoTema,
    calcularProgressoModulo,
    calcularProgressoSemestre
  } = useProgressoFaculdade();

  const handleLocalBack = () => {
    if (selectedAula) {
      setSelectedAula(null);
    } else if (selectedTema) {
      setSelectedTema(null);
    } else if (selectedModulo) {
      setSelectedModulo(null);
    } else if (selectedSemestre) {
      setSelectedSemestre(null);
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
    if (selectedAula && selectedTema) {
      const currentAulaIndex = selectedTema.aulas.findIndex(a => a.id === selectedAula.id);
      const nextAula = selectedTema.aulas[currentAulaIndex + 1];
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

  const filteredSemestres = semestres.filter(semestre => 
    semestre.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    semestre.modulos.some(modulo => 
      modulo.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      modulo.temas.some(tema => 
        tema.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tema.aulas.some(aula => 
          aula.nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
            <h1 className="ml-4 text-lg font-semibold">Curso de Faculdade</h1>
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
            <h1 className="ml-4 text-lg font-semibold">Curso de Faculdade</h1>
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
                {selectedAula.semestre}º Semestre - {selectedAula.modulo}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {/* Player de Vídeo Otimizado */}
          <div className="mb-6 -mx-4 sm:mx-0">
            <CursosVideoPlayer 
              videoUrl={selectedAula.video} 
              title={selectedAula.nome} 
              subtitle={`${selectedAula.semestre}º Semestre • ${selectedAula.tema}`}
              onProgress={handleVideoProgress}
              initialTime={progresso?.tempoAssistido || 0}
              onEnded={handleVideoEnd}
              onNearEnd={handleNearVideoEnd}
              autoPlay={true}
              lesson={{
                id: selectedAula.id,
                area: selectedAula.semestre + 'º Semestre',
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

          {/* Material para Download */}
          {selectedAula.material && (
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Material de Apoio</h2>
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Baixar Material
              </Button>
            </div>
          )}

          <LessonActionButtons lesson={{
            id: selectedAula.id,
            area: selectedAula.semestre + 'º Semestre',
            tema: selectedAula.tema,
            assunto: selectedAula.nome,
            conteudo: selectedAula.conteudo || ''
          }} />
        </div>
        
        <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
        
        <ProfessoraIA 
          video={{
            title: selectedAula.nome,
            area: selectedAula.semestre + 'º Semestre',
            channelTitle: 'Faculdade de Direito'
          }} 
          isOpen={showProfessora} 
          onClose={() => setShowProfessora(false)} 
        />
      </div>
    );
  }

  // Visualização de tema com suas aulas
  if (selectedTema) {
    const progressoTema = calcularProgressoTema(selectedTema.aulas);
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedTema.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header do Tema */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img 
                src={selectedTema.capa || '/placeholder.svg'} 
                alt={selectedTema.nome} 
                className="w-full h-full object-cover" 
                loading="eager" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedTema.nome}</h1>
              </div>
            </div>
            
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <PlayCircle className="w-3 h-3" />
                    <span className="font-medium">{selectedTema.aulas.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{selectedTema.totalDuracao}min</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoTema}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoTema}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Aulas */}
          <div className="space-y-3">
            {selectedTema.aulas.map((aula, index) => {
              const progresso = obterProgresso(aula.id);
              return (
                <div 
                  key={aula.id} 
                  onClick={() => setSelectedAula(aula)} 
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      {aula.capa ? (
                        <img src={aula.capa} alt={aula.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                        <h3 className="font-medium truncate line-clamp-2 text-sm">{aula.nome}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">{aula.tema}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{aula.duracao}min</span>
                        </div>
                        {progresso && (
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {progresso.percentualAssistido}% assistido
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       {progresso?.concluida && (
                         <Badge variant="secondary" className="bg-success/10 text-success">
                           Concluída
                         </Badge>
                       )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {progresso && progresso.percentualAssistido > 0 && (
                    <div className="px-4 pb-3">
                      <Progress value={progresso.percentualAssistido} className="h-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Visualização de módulo com seus temas
  if (selectedModulo) {
    const progressoModulo = calcularProgressoModulo(selectedModulo.temas);
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
                <h1 className="text-2xl font-bold text-white mb-2">{selectedModulo.nome}</h1>
                <p className="text-white/80">{selectedModulo.semestre}º Semestre</p>
              </div>
            </div>
            
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <BookOpen className="w-3 h-3" />
                    <span className="font-medium">{selectedModulo.temas.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{selectedModulo.totalDuracao}min</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoModulo}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoModulo}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Temas */}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedModulo.temas.map((tema, index) => {
              const progressoTema = calcularProgressoTema(tema.aulas);
              return (
                <div 
                  key={`${tema.nome}-${index}`} 
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50" 
                  onClick={() => setSelectedTema(tema)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={tema.capa || '/placeholder.svg'} 
                      alt={tema.nome} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      loading="lazy" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/70 px-2 py-1 rounded-full text-xs text-white">
                        {progressoTema}%
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg mb-1">{tema.nome}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" />
                          <span>{tema.aulas.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{tema.totalDuracao}min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <Progress value={progressoTema} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {progressoTema}% concluído
                      </span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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

  // Visualização de semestre com seus módulos
  if (selectedSemestre) {
    const progressoSemestre = calcularProgressoSemestre(selectedSemestre);
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedSemestre.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header do Semestre */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img 
                src={selectedSemestre.capa || '/placeholder.svg'} 
                alt={selectedSemestre.nome} 
                className="w-full h-full object-cover" 
                loading="eager" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedSemestre.nome}</h1>
              </div>
            </div>
            
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <BookOpen className="w-3 h-3" />
                    <span className="font-medium">{selectedSemestre.modulos.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <PlayCircle className="w-3 h-3" />
                    <span className="font-medium">{selectedSemestre.totalAulas}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoSemestre}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoSemestre}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Módulos */}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedSemestre.modulos.map((modulo, index) => {
              const progressoModulo = calcularProgressoModulo(modulo.temas);
              return (
                <div 
                  key={`${modulo.nome}-${index}`} 
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={modulo.capa || '/placeholder.svg'} 
                      alt={modulo.nome} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      loading="eager" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2">
                        {modulo.nome}
                      </h3>
                      
                      <div className="w-full bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-primary rounded-full h-1 transition-all duration-300" 
                          style={{ width: `${progressoModulo}%` }} 
                        />
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModulo(modulo);
                        }}
                        size="sm" 
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 border-none"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4" onClick={() => setSelectedModulo(modulo)}>
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Módulo completo com {modulo.temas.length} temas sobre {modulo.nome.toLowerCase()}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                            <BookOpen className="w-3 h-3" />
                            <span className="font-medium">{modulo.temas.length}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{modulo.totalDuracao}min</span>
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 text-primary" />
                            <span className="font-medium text-primary">{progressoModulo}%</span>
                          </div>
                        </div>
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

  // Lista principal de semestres
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Curso de Faculdade</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Header dos Cursos */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Semestres de Direito</h2>
              <p className="text-muted-foreground">
                {totalSemestres} semestres • {totalModulos} módulos • {totalAulas} aulas
              </p>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar semestres, módulos ou aulas..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </div>

        {/* Lista de Semestres */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSemestres.map((semestre, index) => {
            const progressoSemestre = calcularProgressoSemestre(semestre);
            return (
              <div 
                key={`${semestre.numero}-${index}`} 
                className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50" 
                onClick={() => setSelectedSemestre(semestre)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={semestre.capa || '/placeholder.svg'} 
                    alt={semestre.nome} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    loading="lazy" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/70 px-2 py-1 rounded-full text-xs text-white">
                      {progressoSemestre}%
                    </div>
                  </div>
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1">{semestre.nome}</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{semestre.modulos.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-4 h-4" />
                        <span>{semestre.totalAulas}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Progress value={progressoSemestre} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {progressoSemestre}% concluído
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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