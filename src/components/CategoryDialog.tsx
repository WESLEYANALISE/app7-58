import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  GraduationCap, 
  Library, 
  Wrench, 
  Target,
  Scale,
  Monitor,
  Newspaper,
  Video,
  Volume2,
  BrainCircuit,
  Gavel,
  Radar,
  ChevronRight,
  Lightbulb,
  MessageCircle,
  FileText
} from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Suspense, lazy } from 'react';
import { FloatingNotesButton } from '@/components/FloatingNotesButton';
import { useCapasFuncaoMap } from '@/hooks/useCapasFuncao';

// Import function images
import listaTarefasImg from '@/assets/functions/lista-tarefas.png';
import videoaulasImg from '@/assets/functions/videoaulas.png';
import cursosPreparatoriosImg from '@/assets/functions/cursos-preparatorios.png';
import audioAulasImg from '@/assets/functions/audio-aulas.png';
import mapasMentaisImg from '@/assets/functions/mapas-mentais.png';
import bibliotecaClassicosImg from '@/assets/functions/biblioteca-classicos.png';
import bibliotecaEstudosImg from '@/assets/functions/biblioteca-estudos.png';
import indicacoesLivrosImg from '@/assets/functions/indicacoes-livros.png';
import artigosComentadosImg from '@/assets/functions/artigos-comentados.png';
import vadeMecumImg from '@/assets/functions/vade-mecum.png';
import assistenteIaImg from '@/assets/functions/assistente-ia.png';
import plataformaDesktopImg from '@/assets/functions/plataforma-desktop.png';
import flashcardsImg from '@/assets/functions/flashcards.png';
import bancoQuestoesImg from '@/assets/functions/banco-questoes.png';
import simuladosOabImg from '@/assets/functions/simulados-oab.png';
import noticiasComentadasImg from '@/assets/functions/noticias-comentadas.png';
import exerciciosPraticosImg from '@/assets/functions/exercicios-praticos.png';
import anotacoesImg from '@/assets/functions/anotacoes.png';

const LazyProductCarousel = lazy(() => import('@/components/ProductCarousel'));

interface CategoryDialogProps {
  category: {
    id: number;
    title: string;
    description: string;
    icon: any;
    color: string;
    bgImage: string;
    functions: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFunctionSelect: (functionName: string) => void;
}

export const CategoryDialog = ({ category, open, onOpenChange, onFunctionSelect }: CategoryDialogProps) => {
  // Execute hooks first - they must always run in the same order
  const { isMobile, isTablet } = useDeviceDetection();
  const { capasMap } = useCapasFuncaoMap();
  const showFloatingNotes = category?.title === 'Estudar Agora';
  
  // Early return after all hooks have been executed
  if (!category) return null;
  
  const handleFunctionClick = (functionName: string) => {
    onFunctionSelect(functionName);
  };
  
  const handleBack = () => {
    onOpenChange(false);
  };
  
  const Icon = category.icon;

  // Capas carregadas imediatamente
  const functionCovers: Record<string, string> = {
    'Lista de Tarefas': 'https://imgur.com/QKHDHbn.png',
    'Videoaulas': 'https://imgur.com/5HQTwme.png',
    'Cursos Preparatórios': 'https://imgur.com/UJcekvc.png',
    'Áudio-aulas': 'https://imgur.com/9pv8qSF.png',
    'Mapas Mentais': 'https://imgur.com/PtlGZxb.png',
    'Biblioteca Clássicos': 'https://imgur.com/3vRJajR.png',
    'Biblioteca de Estudos': 'https://imgur.com/wgqZxSH.png',
    'Biblioteca Concurso Público': 'https://imgur.com/wgqZxSH.png',
    'Biblioteca Exame da Ordem - OAB': 'https://imgur.com/3vRJajR.png',
    'Indicações de Livros': 'https://imgur.com/lLoBEkn.png',
    'Artigos Comentados': 'https://imgur.com/qWMJAqf.png',
    'Vade Mecum Digital': 'https://imgur.com/LmJyy65.png',
    'Assistente IA Jurídica': 'https://imgur.com/Ss0iE2A.png',
    'Plataforma Desktop': 'https://imgur.com/CJvYQaD.png',
    'Flashcards': 'https://imgur.com/VzWqQ9X.png',
    'Banco de Questões': 'https://imgur.com/dxz9Ywi.png',
    'Simulados OAB': 'https://imgur.com/W6cKyNg.png',
    'Notícias Comentadas': 'https://imgur.com/TpD4XjH.png',
    'Exercícios Práticos': 'https://imgur.com/dxz9Ywi.png',
    'Minhas Anotações': 'https://imgur.com/QKHDHbn.png',
    'Resumos Jurídicos': 'https://imgur.com/qWMJAqf.png'
  };

  // Get the gradient based on category color - usando vermelho para todas
  const getDialogGradient = (categoryColor: string) => {
    return 'from-red-700 to-red-900'; // Vermelho do app para todas as categorias
  };
  const dialogGradient = getDialogGradient(category.color);
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="category-dialog-fullscreen p-0 m-0 border-0 rounded-none shadow-none max-w-none max-h-none w-screen h-screen">
          <div className="w-full h-full bg-gray-900 flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
            
            {/* Fixed Header */}
            <div className={`
              flex-shrink-0 bg-gradient-to-br ${dialogGradient} border-b border-white/10
              ${isMobile ? 'px-4 py-4' : isTablet ? 'px-6 py-5' : 'px-8 py-6'}
              flex items-center justify-between relative
            `}>
              
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                onClick={handleBack}
                className="text-white hover:bg-white/20 hover:text-white transition-all duration-300 flex items-center gap-2 px-3 font-medium z-10"
              >
                <ArrowLeft className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} strokeWidth={3} />
                {!isMobile && 'Voltar'}
              </Button>
              
              <div className="flex-1 text-center px-4">
                <div className={`${isMobile ? 'w-8 h-8 mb-1' : isTablet ? 'w-10 h-10 mb-2' : 'w-12 h-12 mb-2'} bg-white/20 rounded-xl flex items-center justify-center mx-auto`}>
                  <Icon className={`${isMobile ? 'w-4 h-4' : isTablet ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                </div>
                <h1 className={`${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'} font-bold text-white leading-tight`}>
                  {category.title}
                </h1>
                
              </div>
              
              <div className={`${isMobile ? 'w-[60px]' : 'w-[80px]'} flex-shrink-0`} />
            </div>

            {/* Scrollable Content */}
            <div className={`
              flex-1 overflow-y-auto overscroll-contain
              ${isMobile ? 'px-4 py-4' : isTablet ? 'px-6 py-5' : 'px-8 py-6'}
              w-full
            `}>
              <div className="max-w-4xl mx-auto w-full space-y-6">

                {/* Layout especial para "Minhas Ferramentas" com ícones */}
                {category.title === 'Minhas Ferramentas' ? (
                  <div className="grid grid-cols-1 gap-6 w-full">
                    {/* Dividir funções em pares */}
                    {Array.from({ length: Math.ceil(category.functions.length / 2) }, (_, pairIndex) => {
                      const functionPair = category.functions.slice(pairIndex * 2, pairIndex * 2 + 2);
                      return (
                        <div key={pairIndex} className="grid grid-cols-2 gap-4">
                          {functionPair.map((functionName, index) => {
                            const functionIcon = getFunctionIcon(functionName);
                            const IconComponent = functionIcon;
                            return (
                              <div 
                                key={index} 
                                onClick={() => handleFunctionClick(functionName)} 
                                className={`
                                  cursor-pointer rounded-2xl transition-all duration-300 hover:scale-[1.02]
                                  hover:shadow-xl hover:shadow-red-500/20 group relative overflow-hidden
                                  border border-white/20 bg-white/5 backdrop-blur-sm
                                  ${isMobile ? 'p-4 min-h-[140px]' : isTablet ? 'p-5 min-h-[160px]' : 'p-6 min-h-[180px]'}
                                  active:scale-[0.98] touch-manipulation w-full flex flex-col
                                  hover:bg-white/10 hover:border-red-500/30
                                `}
                              >
                                {/* Overlay com gradiente vermelho sutil */}
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                
                                {/* Ícone */}
                                <div className="flex justify-center mb-3">
                                  <div className={`
                                    ${isMobile ? 'w-12 h-12' : isTablet ? 'w-14 h-14' : 'w-16 h-16'}
                                    bg-gradient-to-br from-red-500 to-red-600 rounded-xl 
                                    flex items-center justify-center
                                    group-hover:from-red-400 group-hover:to-red-500
                                    group-hover:scale-110 transition-all duration-300
                                    shadow-lg shadow-red-500/25
                                  `}>
                                    <IconComponent className={`
                                      ${isMobile ? 'w-6 h-6' : isTablet ? 'w-7 h-7' : 'w-8 h-8'} 
                                      ${functionName === 'Assistente Evelyn' ? 'text-green-400' : 'text-white'}
                                    `} />
                                  </div>
                                </div>
                                
                                {/* Título */}
                                <h3 className={`
                                  ${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} 
                                  font-semibold text-white text-center mb-2 leading-tight
                                  group-hover:text-red-100 transition-colors duration-300
                                `}>
                                  {functionName}
                                </h3>
                                
                                {/* Descrição */}
                                <p className={`
                                  ${isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm'} 
                                  text-white/70 text-center leading-relaxed flex-1
                                  group-hover:text-white/85 transition-colors duration-300
                                `}
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {getFunctionDescription(functionName)}
                                </p>
                                
                                {/* Indicador de hover */}
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                </div>
                              </div>
                            );
                          })}
                          {/* Se for impar, adicionar espaço vazio */}
                          {functionPair.length === 1 && <div></div>}
                        </div>
                      );
                    })}
                  </div>
                ) : category.title === 'Estudar Agora' ? (
                  /* Layout híbrido para "Estudar Agora" */
                  <div className="grid grid-cols-1 gap-6 w-full">
                    {/* Cursos Preparatórios com capa */}
                    {category.functions.filter(fn => fn === 'Cursos Preparatórios').map((functionName, index) => {
                      const functionCover = capasMap[functionName] || functionCovers[functionName] || getFunctionImage(functionName);
                      return (
                        <div 
                          key={index} 
                          onClick={() => handleFunctionClick(functionName)} 
                          className={`
                            cursor-pointer rounded-2xl transition-all duration-300 hover:scale-[1.02]
                            hover:shadow-xl hover:shadow-primary/20 group relative overflow-hidden
                            border border-white/20 ${isMobile ? 'p-6 h-60' : isTablet ? 'p-7 h-64' : 'p-8 h-72'}
                            active:scale-[0.98] touch-manipulation w-full flex flex-col justify-end
                            backdrop-blur-sm bg-white/5
                          `}
                        >
                          {/* Imagem de fundo sem blur */}
                          <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
                            style={{
                              backgroundImage: `url(${functionCover})`
                            }}
                          ></div>
                          
                          {/* Overlay escuro com gradiente para enfatizar o nome */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 group-hover:from-black/85 group-hover:via-black/50 group-hover:to-black/20 transition-all duration-300"></div>
                          
                          {/* Efeito brilhante sutil no hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                          
                          {/* Nome e descrição com gradiente brilhante e maior contraste */}
                          <div className="relative w-full">
                            <div className="relative">
                              <h3 className={`
                                ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'} 
                                font-bold text-white mb-3 leading-tight
                                bg-gradient-to-r from-white via-yellow-50 to-white
                                bg-clip-text
                                group-hover:from-yellow-100 group-hover:via-white group-hover:to-blue-100
                                transition-all duration-300
                                drop-shadow-2xl
                                [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%)]
                              `}>
                                {functionName}
                              </h3>
                              
                              {/* Descrição da função */}
                              <p className={`
                                ${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} 
                                text-white/90 mb-2 leading-relaxed
                                group-hover:text-white/95 transition-colors duration-300
                                drop-shadow-lg
                                [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]
                              `}>
                                {getFunctionDescription(functionName)}
                              </p>
                              
                              {/* Linha brilhante embaixo do texto */}
                              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/80 via-yellow-400/60 to-transparent w-0 group-hover:w-full transition-all duration-500 delay-100 drop-shadow-lg"></div>
                              
                              {/* Brilho adicional */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"></div>
                            </div>
                            
                             {/* Seta clicável */}
                             <div className="absolute top-4 right-4">
                               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                 <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                               </div>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Resumos Jurídicos, Flashcards, Áudio-aulas e Mapas Mentais lado a lado sem capa */}
                    <div className="grid grid-cols-2 gap-4">
                      {category.functions.filter(fn => fn !== 'Cursos Preparatórios').map((functionName, index) => {
                        const functionIcon = getFunctionIcon(functionName);
                        const IconComponent = functionIcon;
                        return (
                          <div 
                            key={index} 
                            onClick={() => handleFunctionClick(functionName)} 
                            className={`
                              cursor-pointer rounded-2xl transition-all duration-300 hover:scale-[1.02]
                              hover:shadow-xl hover:shadow-red-500/20 group relative overflow-hidden
                              border border-white/20 bg-white/5 backdrop-blur-sm
                              ${isMobile ? 'p-4 min-h-[140px]' : isTablet ? 'p-5 min-h-[160px]' : 'p-6 min-h-[180px]'}
                              active:scale-[0.98] touch-manipulation w-full flex flex-col
                              hover:bg-white/10 hover:border-red-500/30
                            `}
                          >
                            {/* Overlay com gradiente vermelho sutil */}
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                            
                            {/* Ícone */}
                            <div className="flex justify-center mb-3">
                              <div className={`
                                ${isMobile ? 'w-12 h-12' : isTablet ? 'w-14 h-14' : 'w-16 h-16'}
                                bg-gradient-to-br from-red-500 to-red-600 rounded-xl 
                                flex items-center justify-center
                                group-hover:from-red-400 group-hover:to-red-500
                                group-hover:scale-110 transition-all duration-300
                                shadow-lg shadow-red-500/25
                              `}>
                                <IconComponent className={`
                                  ${isMobile ? 'w-6 h-6' : isTablet ? 'w-7 h-7' : 'w-8 h-8'} 
                                  ${functionName === 'Assistente Evelyn' ? 'text-green-400' : 'text-white'}
                                `} />
                              </div>
                            </div>
                            
                            {/* Título */}
                            <h3 className={`
                              ${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} 
                              font-semibold text-white text-center mb-2 leading-tight
                              group-hover:text-red-100 transition-colors duration-300
                            `}>
                              {functionName}
                            </h3>
                            
                            {/* Descrição */}
                            <p className={`
                              ${isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm'} 
                              text-white/70 text-center leading-relaxed flex-1
                              group-hover:text-white/85 transition-colors duration-300
                            `}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {getFunctionDescription(functionName)}
                            </p>
                            
                            {/* Indicador de hover */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Layout original para outras categorias */
                  <div className="grid grid-cols-1 gap-4 w-full">
                    {category.functions.map((functionName, index) => {
                      const functionCover = capasMap[functionName] || functionCovers[functionName] || getFunctionImage(functionName);
                      return (
                        <div 
                          key={index} 
                          onClick={() => handleFunctionClick(functionName)} 
                          className={`
                            cursor-pointer rounded-2xl transition-all duration-300 hover:scale-[1.02]
                            hover:shadow-xl hover:shadow-primary/20 group relative overflow-hidden
                            border border-white/20 ${isMobile ? 'p-6 h-60' : isTablet ? 'p-7 h-64' : 'p-8 h-72'}
                            active:scale-[0.98] touch-manipulation w-full flex flex-col justify-end
                            backdrop-blur-sm bg-white/5
                          `}
                        >
                          {/* Imagem de fundo sem blur */}
                          <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
                            style={{
                              backgroundImage: `url(${functionCover})`
                            }}
                          ></div>
                          
                          {/* Overlay escuro com gradiente para enfatizar o nome */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 group-hover:from-black/85 group-hover:via-black/50 group-hover:to-black/20 transition-all duration-300"></div>
                          
                          {/* Efeito brilhante sutil no hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                          
                          {/* Nome e descrição com gradiente brilhante e maior contraste */}
                          <div className="relative w-full">
                            <div className="relative">
                              <h3 className={`
                                ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'} 
                                font-bold text-white mb-3 leading-tight
                                bg-gradient-to-r from-white via-yellow-50 to-white
                                bg-clip-text
                                group-hover:from-yellow-100 group-hover:via-white group-hover:to-blue-100
                                transition-all duration-300
                                drop-shadow-2xl
                                [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%)]
                              `}>
                                {functionName}
                              </h3>
                              
                              {/* Descrição da função */}
                              <p className={`
                                ${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} 
                                text-white/90 mb-2 leading-relaxed
                                group-hover:text-white/95 transition-colors duration-300
                                drop-shadow-lg
                                [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]
                              `}>
                                {getFunctionDescription(functionName)}
                              </p>
                              
                              {/* Linha brilhante embaixo do texto */}
                              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/80 via-yellow-400/60 to-transparent w-0 group-hover:w-full transition-all duration-500 delay-100 drop-shadow-lg"></div>
                              
                              {/* Brilho adicional */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"></div>
                            </div>
                            
                            {/* Seta clicável */}
                            <div className="absolute top-2 right-2">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Floating Notes Button - only show for "Estudar Agora" */}
      {showFloatingNotes && <FloatingNotesButton show={showFloatingNotes} />}
    </>
  );
};

// Helper function to get function images
const getFunctionImage = (functionName: string): string => {
  const imageMap: Record<string, string> = {
    'Lista de Tarefas': listaTarefasImg,
    'Videoaulas': videoaulasImg,
    'Cursos Preparatórios': cursosPreparatoriosImg,
    'Áudio-aulas': audioAulasImg,
    'Mapas Mentais': mapasMentaisImg,
    'Biblioteca Clássicos': bibliotecaClassicosImg,
    'Biblioteca de Estudos': bibliotecaEstudosImg,
    'Biblioteca Concurso Público': bibliotecaEstudosImg,
    'Biblioteca Exame da Ordem - OAB': bibliotecaClassicosImg,
    'Indicações de Livros': indicacoesLivrosImg,
    'Artigos Comentados': artigosComentadosImg,
    'Vade Mecum Digital': vadeMecumImg,
    'Assistente IA Jurídica': assistenteIaImg,
    'Plataforma Desktop': plataformaDesktopImg,
    'Flashcards': flashcardsImg,
    'Banco de Questões': bancoQuestoesImg,
    'Simulados OAB': simuladosOabImg,
    'Notícias Comentadas': noticiasComentadasImg,
    'Exercícios Práticos': exerciciosPraticosImg,
    'Minhas Anotações': anotacoesImg,
    'Petições': anotacoesImg
  };
  return imageMap[functionName] || '';
};

// Helper function to get function icons for "Minhas Ferramentas" e "Estudar Agora"
const getFunctionIcon = (functionName: string) => {
  const iconMap: Record<string, any> = {
    'Assistente Evelyn': MessageCircle,
    'Vade Mecum Digital': Scale,
    'Plataforma Desktop': Monitor,
    'Notícias Comentadas': Newspaper,
    'Videoaulas': Video,
    'Áudio-aulas': Volume2,
    'Mapas Mentais': BrainCircuit,
    'Radar Jurídico': Radar,
    'Blog Jurídico': Newspaper,
    'Resumos Jurídicos': Library,
    'Flashcards': Lightbulb,
    'Cursos Preparatórios': GraduationCap,
    'Artigos Comentados': Newspaper,
    'Redação Perfeita': Target,
    'Plano de estudo': Target,
    'Petições': FileText
  };
  return iconMap[functionName] || Wrench;
};

// Helper function to get function descriptions
const getFunctionDescription = (functionName: string): string => {
  const descriptions: Record<string, string> = {
    'Lista de Tarefas': 'Organize e gerencie suas atividades de estudo com listas personalizadas e controle de progresso',
    'Videoaulas': 'Aprenda com professores especializados através de vídeos didáticos organizados por área do direito',
    'Cursos Preparatórios': 'Trilhas organizadas de aprendizado estruturadas para maximizar sua preparação',
    'Áudio-aulas': 'Escute conteúdos educativos enquanto realiza outras atividades, otimizando seu tempo',
    'Mapas Mentais': 'Visualize e organize conceitos jurídicos de forma clara e intuitiva para melhor fixação',
    'Biblioteca Clássicos': 'Acesse obras fundamentais da literatura jurídica e autores renomados',
    'Biblioteca de Estudos': 'Material especializado selecionado para concursos e aprofundamento teórico',
    'Biblioteca Concurso Público': 'Livros específicos organizados por áreas para concursos públicos',
    'Biblioteca Exame da Ordem - OAB': 'Material direcionado especificamente para o Exame da OAB',
    'Indicações de Livros': 'Recomendações curadas de obras essenciais para cada área do direito',
    'Artigos Comentados': 'Análises detalhadas de artigos de códigos e legislação com comentários',
    'Vade Mecum Digital': 'Consulte códigos e leis de forma rápida com busca inteligente e favoritos',
    'Assistente IA Jurídica': 'Tire dúvidas e obtenha esclarecimentos jurídicos com inteligência artificial',
    'Plataforma Desktop': 'Versão completa para computador com recursos avançados e interface otimizada',
    'Flashcards': 'Memorize conceitos importantes com sistema de repetição espaçada',
    'Banco de Questões': 'Pratique com milhares de questões comentadas organizadas por assunto',
    'Simulados OAB': 'Prepare-se com simulados realistas do Exame da OAB com correção detalhada',
    'Notícias Comentadas': 'Analise casos atuais e jurisprudências com comentários especializados',
    'Exercícios Práticos': 'Aplique o conhecimento adquirido com casos práticos e exercícios',
    'Minhas Anotações': 'Sistema pessoal para organizar seus resumos, estudos e observações',
    'Resumos Jurídicos': 'Resumos organizados e estruturados por área do direito para revisão rápida',
    'Radar Jurídico': 'Acompanhe as últimas novidades jurídicas e mudanças legislativas',
    'Blog Jurídico': 'Artigos e análises especializadas sobre temas jurídicos atuais',
    'Petições': 'Acesse mais de 35 mil modelos de petições organizados por área jurídica'
  };
  return descriptions[functionName] || 'Explore esta funcionalidade especializada para seus estudos jurídicos';
};