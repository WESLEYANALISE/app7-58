
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { NoticiasJuridicas } from '@/components/NoticiasJuridicas';
import { NoticiasComentadas } from '@/components/NoticiasComentadas';
import { Downloads } from '@/components/Downloads';
import { PlataformaDesktop } from '@/components/PlataformaDesktop';
import { Videoaulas } from '@/components/Videoaulas';
import { CursosPreparatorios } from '@/components/CursosPreparatorios';
import { Anotacoes } from '@/components/Anotacoes';
import { Explorar } from '@/components/Explorar';
import { Premium } from '@/components/Premium';
import { AssistenteIA } from '@/components/AssistenteIA';
import AssistenteEvelyn from '@/components/AssistenteEvelyn';
import { BibliotecaClassicos } from '@/components/BibliotecaClassicos';
import { BibliotecaConcursoPublico } from '@/components/BibliotecaConcursoPublico';
import { BibliotecaExameOAB } from '@/components/BibliotecaExameOAB';
import { BibliotecaEstudos } from '@/components/BibliotecaEstudos';
import { ResumosJuridicos } from '@/components/ResumosJuridicos';
import { Loja } from '@/components/Loja';
import { BancoQuestoes } from '@/components/BancoQuestoes';
import { RadarJuridico } from '@/components/RadarJuridico';
import { VadeMecum } from '@/components/VadeMecum';
import { Audioaulas } from '@/components/Audioaulas';
import { useEffect, useState } from 'react';
import { Juriflix } from '@/components/Juriflix';
import { MapasMentais } from '@/components/MapasMentais';
import { PlanoEstudo } from '@/components/PlanoEstudo/PlanoEstudo';
import { Redacao } from '@/components/Redacao';
import BloggerJuridico from '@/components/BloggerJuridico';
import { IndicacoesLivros } from '@/components/IndicacoesLivros';

export const AppFunction = () => {
  const { currentFunction, setCurrentFunction } = useNavigation();
  const { functions, loading, findFunction } = useAppFunctions();
  const [functionData, setFunctionData] = useState<any>(null);

  useEffect(() => {
    console.log('AppFunction - currentFunction:', currentFunction);
    console.log('AppFunction - functions:', functions);
    
    if (currentFunction && functions.length > 0) {
      const func = findFunction(currentFunction);
      console.log('AppFunction - functionData encontrada:', func);
      setFunctionData(func || null);
    } else {
      setFunctionData(null);
    }
  }, [currentFunction, functions, findFunction]);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  if (!currentFunction) {
    return null;
  }

  // Componentes específicos que sempre devem ser internos (não usar links da tabela)
  const renderSpecificComponent = () => {
    // Funções que sempre devem usar componentes internos
    const lowerCaseFunction = currentFunction.toLowerCase();
    
    // Downloads e Plataforma Desktop sempre internos
    if (currentFunction === 'Downloads' || lowerCaseFunction.includes('downloads')) {
      return <Downloads />;
    }
    
    if (currentFunction === 'Plataforma Desktop' || lowerCaseFunction.includes('plataforma desktop')) {
      return <PlataformaDesktop />;
    }
    
    // Videoaulas sempre interno
    if (currentFunction === 'Videoaulas' || lowerCaseFunction.includes('videoaulas') || lowerCaseFunction.includes('vídeoaulas')) {
      return <Videoaulas />;
    }
    
    // Notícias Jurídicas/Portais Jurídicos sempre interno
    if (currentFunction === 'Notícias Jurídicas' || 
        currentFunction === 'Portais Jurídicos' ||
        lowerCaseFunction.includes('notícias jurídicas') || 
        lowerCaseFunction.includes('portais jurídicos') ||
        lowerCaseFunction.includes('noticias juridicas') ||
        lowerCaseFunction.includes('portais juridicos')) {
      return <NoticiasJuridicas />;
    }

    // Resumos Jurídicos sempre usar componente nativo
    if (currentFunction === 'Resumos Jurídicos' || 
        lowerCaseFunction.includes('resumos jurídicos') ||
        lowerCaseFunction.includes('resumos juridicos')) {
      return <ResumosJuridicos />;
    }

    // Outros componentes específicos
    switch (currentFunction) {
      case 'Assistente Evelyn':
        return <AssistenteEvelyn />;
      case 'Notícias Comentadas':
        return <NoticiasComentadas />;
      case 'Anotações':
        return <Anotacoes />;
      case 'Explorar':
        return <Explorar />;
      case 'Premium':
        return <Premium />;
      case 'Loja':
        return <Loja />;
      case 'Assistente IA Jurídica':
      case 'Assistente IA':
      case 'Assistente Evelyn':
        return <AssistenteIA />;
      case 'Biblioteca Clássicos':
        return <BibliotecaClassicos />;
      case 'Biblioteca Concurso Público':
        return <BibliotecaConcursoPublico />;
      case 'Biblioteca Exame da Ordem - OAB':
        return <BibliotecaExameOAB />;
      case 'Biblioteca de Estudos':
        return <BibliotecaEstudos />;
      case 'Resumos Jurídicos':
        return <ResumosJuridicos />;
      case 'Banco de Questões':
        return <BancoQuestoes />;
      case 'Radar Jurídico':
        return <RadarJuridico />;
      case 'Vade Mecum':
      case 'Vade Mecum Digital':
        return <VadeMecum />;
      case 'Cursos Preparatórios':
      case 'Cursos Preparatorios':
        return <CursosPreparatorios />;
      case 'Áudio-aulas':
      case 'Audio-aulas':
      case 'Audioaulas':
        return <Audioaulas />;
      case 'Juriflix':
        return <Juriflix />;
      case 'Mapas Mentais':
        return <MapasMentais />;
      case 'Plano de estudo':
      case 'Plano de Estudo':
        return <PlanoEstudo />;
      case 'Redação Perfeita':
      case 'Redação':
        return <Redacao />;
      case 'Blog Jurídico':
      case 'Blogger Jurídico':
      case 'JusBlog':
        return <BloggerJuridico />;
      case 'Indicações de Livros':
        return <IndicacoesLivros />;
      default:
        return null;
    }
  };

  const specificComponent = renderSpecificComponent();

  // Se tem componente específico, renderizar
  if (specificComponent) {
    return specificComponent;
  }

  // Se tem link na tabela APP, usar iframe (apenas para funções que não têm componente específico)
  if (functionData && functionData.link && functionData.link.trim() !== '') {
    return (
      <div className="fixed inset-0 bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 hover:bg-accent/80"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold truncate">{functionData.funcao}</h1>
          </div>
        </div>
        <div className="pt-14 h-full">
          <iframe 
            src={functionData.link} 
            className="w-full h-full border-0" 
            title={functionData.funcao}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Fallback para funções sem link ou componente específico
  return (
    <div className="fixed inset-0 bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">{currentFunction}</h1>
        </div>
      </div>

      <div className="pt-14 h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
              <div className="text-2xl">⚡</div>
            </div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {currentFunction}
            </h2>
            <div className="mb-6">
              <p className="text-lg font-semibold text-foreground mb-2">
                Funcionalidade carregada instantaneamente!
              </p>
              <p className="text-primary font-medium">
                Sem tempo de carregamento - experiência otimizada.
              </p>
            </div>
          </div>
          {!functionData && (
            <p className="text-sm text-amber-400">
              Esta função será implementada em breve
            </p>
          )}
          {functionData && (!functionData.link || functionData.link.trim() === '') && (
            <p className="text-sm text-amber-400">
              Link em configuração
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
