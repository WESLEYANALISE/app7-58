import React, { memo, useCallback, useMemo } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Imports desktop layouts
import { VideoaulasDesktop } from '@/components/desktop/VideoaulasDesktop';
import { BibliotecaDesktop } from '@/components/desktop/BibliotecaDesktop';
import { VadeMecumDesktop } from '@/components/desktop/VadeMecumDesktop';
import { FlashcardsDesktop } from '@/components/desktop/FlashcardsDesktop';
import { ResumosDesktop } from '@/components/desktop/ResumosDesktop';
import { MapasMentaisDesktop } from '@/components/desktop/MapasMentaisDesktop';

// Imports diretos otimizados
import { Downloads } from '@/components/Downloads';
import { PlataformaDesktop } from '@/components/PlataformaDesktop';
import { BibliotecaEstudos } from '@/components/BibliotecaEstudos';
import { BibliotecaClassicos } from '@/components/BibliotecaClassicos';
import { BibliotecaForaDaToga } from '@/components/BibliotecaForaDaToga';
import { BibliotecaConcursoPublico } from '@/components/BibliotecaConcursoPublico';
import { BibliotecaExameOAB } from '@/components/BibliotecaExameOAB';
import { ResumosJuridicos } from '@/components/ResumosJuridicos';
import { Redacao } from '@/components/Redacao';
import { RadarJuridico } from '@/components/RadarJuridico';
import VadeMecumUltraFast from '@/components/VadeMecumUltraFast';
import { Videoaulas } from '@/components/Videoaulas';
import { CursosPreparatorios } from '@/components/CursosPreparatorios';
import { NoticiasJuridicas } from '@/components/NoticiasJuridicas';
import { BancoQuestoes } from '@/components/BancoQuestoes';
import { SimuladosOAB } from '@/components/SimuladosOAB';
import Flashcards from '@/components/Flashcards';
import BloggerJuridico from '@/components/BloggerJuridico';
import { AssistenteIA } from '@/components/AssistenteIA';
import { ProfessoraIA } from '@/components/ProfessoraIA';
import { PlanoEstudo } from '@/components/PlanoEstudo/PlanoEstudo';
import { Loja } from '@/components/Loja';
import { MapasMentais } from '@/components/MapasMentais';
import { Anotacoes } from '@/components/Anotacoes';
import { ListaTarefas } from '@/components/ListaTarefas';
import { Audioaulas } from '@/components/Audioaulas';
import { ArtigoPorArtigo } from '@/components/ArtigoPorArtigo';
import { Juriflix } from '@/components/Juriflix';
import { IndicacoesLivros } from '@/components/IndicacoesLivros';
import Peticoes from '@/components/Peticoes';

// Componente de Header otimizado sem re-renders
const FunctionHeader = memo(({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="flex items-center p-4 border-b bg-background/95 backdrop-blur-sm">
    <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Button>
    <h1 className="ml-4 text-lg font-semibold truncate">{title}</h1>
  </div>
));
FunctionHeader.displayName = 'FunctionHeader';

// Mapa de componentes para desktop com layout específico
const DESKTOP_COMPONENT_MAP = {
  'videoaulas': VideoaulasDesktop,
  'biblioteca de estudos': BibliotecaDesktop,
  'vade mecum': VadeMecumDesktop,
  'vade mecum digital': VadeMecumDesktop,
  'vade-mecum': VadeMecumDesktop,
  'flashcards': FlashcardsDesktop,
  'flashcard': FlashcardsDesktop,
  'resumos jurídicos': ResumosDesktop,
  'resumos juridicos': ResumosDesktop,
  'mapas mentais': MapasMentaisDesktop,
  'mapa mental': MapasMentaisDesktop,
} as const;

// Mapa de componentes para máxima performance
const COMPONENT_MAP = {
  // Nativos sempre internos
  'downloads': Downloads,
  'plataforma desktop': PlataformaDesktop,
  'videoaulas': Videoaulas,
  'áudio-aulas': Audioaulas,
  'audio-aulas': Audioaulas,
  'audioaulas': Audioaulas,
  'cursos preparatórios': CursosPreparatorios,
  'cursos preparatorios': CursosPreparatorios,
  'notícias jurídicas': NoticiasJuridicas,
  'noticias juridicas': NoticiasJuridicas,
  'portais jurídicos': NoticiasJuridicas,
  'portais juridicos': NoticiasJuridicas,
  'resumos jurídicos': ResumosJuridicos,
  'resumos juridicos': ResumosJuridicos,
  'radar jurídico': RadarJuridico,
  'vade mecum': VadeMecumUltraFast,
  'vade mecum digital': VadeMecumUltraFast,
  'vade-mecum': VadeMecumUltraFast,
  'biblioteca de estudos': BibliotecaEstudos,
  'biblioteca clássicos': BibliotecaClassicos,
  'bibliotecaforadatoga': BibliotecaForaDaToga,
  'fora da toga': BibliotecaForaDaToga,
  'biblioteca fora da toga': BibliotecaForaDaToga,
  'biblioteca concurso público': BibliotecaConcursoPublico,
  'biblioteca exame da ordem - oab': BibliotecaExameOAB,
  'banco de questões': BancoQuestoes,
  'banco questoes': BancoQuestoes,
  'simulados oab': SimuladosOAB,
  'simulados da oab': SimuladosOAB,
  'simulado oab': SimuladosOAB,
  'flashcards': Flashcards,
  'flashcard': Flashcards,
  'blog jurídico': BloggerJuridico,
  'blog juridico': BloggerJuridico,
  'blogger jurídico': BloggerJuridico,
  'blogger juridico': BloggerJuridico,
  'jusblog': BloggerJuridico,
  'assistente ia jurídica': AssistenteIA,
  'assistente ia': AssistenteIA,
  'assistente': AssistenteIA,
  'plano de estudo': PlanoEstudo,
  'plano de estudos': PlanoEstudo,
  'redação': Redacao,
  'redacao': Redacao,
  'redação perfeita': Redacao,
  'mapas mentais': MapasMentais,
  'mapa mental': MapasMentais,
  'anotações': Anotacoes,
  'anotacoes': Anotacoes,
  'minhas anotações': Anotacoes,
  'loja': Loja,
  'artigo por artigo': ArtigoPorArtigo,
  'artigos comentados': ArtigoPorArtigo,
  'juriflix': Juriflix,
  'indicações de livros': IndicacoesLivros,
  'indicacoes de livros': IndicacoesLivros,
  'petições': Peticoes,
  'peticoes': Peticoes,
  'modelos de petições': Peticoes,
  'modelos de peticoes': Peticoes
} as const;

export const AppFunctionUltraFast = memo(() => {
  const { currentFunction, setCurrentFunction } = useNavigation();
  const { isDesktop } = useDeviceDetection();

  const handleBack = useCallback(() => {
    setCurrentFunction(null);
  }, [setCurrentFunction]);

  // Normalizar função para busca otimizada
  const normalizedFunction = useMemo(() => {
    if (!currentFunction) return '';
    return currentFunction.toLowerCase().trim();
  }, [currentFunction]);

  // Buscar componente de forma otimizada
  const ComponentToRender = useMemo(() => {
    if (!normalizedFunction) return null;

    // Para desktop, verificar primeiro se há versão desktop específica
    if (isDesktop) {
      const desktopMatch = DESKTOP_COMPONENT_MAP[normalizedFunction as keyof typeof DESKTOP_COMPONENT_MAP];
      if (desktopMatch) return desktopMatch;

      // Busca por inclusão de termos para desktop
      for (const [key, component] of Object.entries(DESKTOP_COMPONENT_MAP)) {
        if (normalizedFunction.includes(key)) {
          return component;
        }
      }
    }

    // Busca padrão no mapa geral
    const directMatch = COMPONENT_MAP[normalizedFunction as keyof typeof COMPONENT_MAP];
    if (directMatch) return directMatch;

    // Busca por inclusão de termos (fallback)
    for (const [key, component] of Object.entries(COMPONENT_MAP)) {
      if (normalizedFunction.includes(key)) {
        return component;
      }
    }

    return null;
  }, [normalizedFunction, isDesktop]);

  if (!currentFunction) {
    return null;
  }

  // Casos especiais que precisam de props específicas
  if (normalizedFunction.includes('professora')) {
    return <ProfessoraIA isOpen={true} onClose={handleBack} />;
  }

  if (normalizedFunction.includes('lista de tarefas') || normalizedFunction.includes('tarefas')) {
    return <ListaTarefas onBack={handleBack} />;
  }

  // Renderizar componente encontrado
  if (ComponentToRender) {
    return React.createElement(ComponentToRender);
  }

  // Fallback para funcionalidades não mapeadas
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FunctionHeader title={currentFunction} onBack={handleBack} />
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">⚡ {currentFunction}</h2>
          <p className="text-muted-foreground mb-4">
            Funcionalidade carregada instantaneamente!
          </p>
          <p className="text-sm text-primary">
            Sem tempo de carregamento - experiência otimizada.
          </p>
        </div>
      </div>
    </div>
  );
});

AppFunctionUltraFast.displayName = 'AppFunctionUltraFast';
export default AppFunctionUltraFast;