import { Card, CardContent } from '@/components/ui/card';
import { useSuperFastAppFunctions } from '@/hooks/useSuperFastAppFunctions';
import { useCapasFuncaoMap } from '@/hooks/useCapasFuncao';
import { useNavigation } from '@/context/NavigationContext';
import { ArrowRight, GitBranch, Scale, Bot, Headphones, Library, Monitor, Play, Folder, Newspaper, Film, Brain, BookOpen, FileText, Search, GraduationCap, Calendar, Clock, Award, Target, Bookmark, Download, Upload, Share, Heart, Star, Zap, Shield, Globe, Camera, Music, Video, Image, File, Archive, Code, Database, Hammer, ShoppingBag, Users, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Definição das categorias e suas funções
const categoriesConfig = {
  'Biblioteca e Leitura': {
    color: 'emerald',
    functions: [1, 3, 2, 20, 24],
    // Vade Mecum, Biblioteca, Downloads, Biblioteca de Clássicos, Indicações de Livros
    gradient: 'from-emerald-500 to-green-600'
  },
  'Estudos e Aprendizado': {
    color: 'blue',
    functions: [11, 5, 15],
    // Cursos, Resumos, Dicionário
    gradient: 'from-blue-500 to-sky-600'
  },
  'Minhas Ferramentas': {
    color: 'amber',
    functions: ['Assistente Evelyn', 1, 12, 18, 9, 8, 4, 13],
    // Assistente Evelyn, Vade Mecum, Assistente IA, Desktop, Flashcards, Videoaulas, Áudio-aulas, Mapas Mentais
    gradient: 'from-amber-500 to-yellow-600'
  },
  'Preparação para Provas': {
    color: 'purple',
    functions: [22, 7],
    // Banco de Questões, Simulados OAB
    gradient: 'from-purple-500 to-violet-600'
  },
  'Atualizações e Informações': {
    color: 'cyan',
    functions: [17, 16],
    // Notícias Jurídicas, Juriflix
    gradient: 'from-cyan-500 to-teal-600'
  }
};

// Mapeamento de ícones por função
const getIconForFunction = (funcao: string, id: number) => {
  const name = funcao.toLowerCase();

  // Mapeamento específico por ID e nome
  if (id === 1 || name.includes('vade') || name.includes('mecum')) return Scale;
  if (id === 12 || name.includes('assistente') && name.includes('ia')) return Bot;
  if (id === 3 || name.includes('biblioteca') && name.includes('jurídica')) return BookOpen;
  if (id === 4 || name.includes('audio') || name.includes('áudio')) return Headphones;
  if (id === 13 || name.includes('mapa') && name.includes('mental')) return Brain;
  if (id === 18 || name.includes('plataforma') && name.includes('desktop')) return Monitor;
  if (id === 9 || name.includes('flashcard') || name.includes('flash card')) return Zap;
  if (id === 5 || name.includes('resumo')) return FileText;
  if (id === 8 || name.includes('video') || name.includes('vídeo') || name.includes('aula')) return Play;
  if (id === 10 || name.includes('petições') || name.includes('peticoes') || name.includes('petição')) return Folder;
  if (id === 17 || name.includes('noticia') || name.includes('notícia') || name.includes('juridica')) return Newspaper;
  if (id === 16 || name.includes('juriflix') || name.includes('filme') || name.includes('cinema')) return Film;
  if (id === 22 || name.includes('questões') || name.includes('questao') || name.includes('questão')) return Target;
  if (id === 7 || name.includes('simulado') || name.includes('prova') || name.includes('oab')) return Scale;
  if (id === 11 || name.includes('curso')) return GraduationCap;
  if (id === 15 || name.includes('dicionário') || name.includes('dicionario')) return Search;
  if (id === 2 || name.includes('download') || name.includes('baixar')) return Download;
  if (id === 20 || name.includes('biblioteca') && name.includes('clássicos')) return BookOpen;
  if (id === 24 || name.includes('indicações') || name.includes('indicacao') || name.includes('livros')) return Star;
  return BookOpen; // ícone padrão
};

export const FeaturesGrid = () => {
  const {
    functions
  } = useSuperFastAppFunctions();
  const { capasMap } = useCapasFuncaoMap();
  const {
    setCurrentFunction
  } = useNavigation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bibliotecaPoderLink, setBibliotecaPoderLink] = useState<string>('');

  // Buscar link da Biblioteca de Poder Pessoal
  useEffect(() => {
    const fetchBibliotecaPoderLink = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('APP').select('link').eq('funcao', 'Biblioteca de Poder Pessoal').single();
        if (error) {
          console.error('Erro ao buscar link da Biblioteca de Poder Pessoal:', error);
          return;
        }
        if (data?.link) {
          setBibliotecaPoderLink(data.link);
        }
      } catch (err) {
        console.error('Erro ao carregar link:', err);
      }
    };
    fetchBibliotecaPoderLink();
  }, []);
  
  const handleFunctionClick = (funcao: string) => {
    setCurrentFunction(funcao);
  };
  
  const handleBibliotecaHabilidades = () => {
    handleFunctionClick('Biblioteca de Habilidades Pessoais');
    setIsDialogOpen(false);
  };

  // Função para agrupar funções por categoria
  const groupFunctionsByCategory = () => {
    const grouped: {
      [key: string]: typeof functions;
    } = {};
    Object.entries(categoriesConfig).forEach(([categoryName, config]) => {
      grouped[categoryName] = functions.filter(func => config.functions.includes(func.id) && func.id !== 14 // Remove duplicata do ID 14
      );
    });
    return grouped;
  };

  
  const groupedFunctions = groupFunctionsByCategory();
  
  return <div className="py-12 sm:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gradient-text-legal">
            Ferramentas Jurídicas Profissionais
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Acesse todas as funcionalidades organizadas por categoria
          </p>
        </div>

        {/* Renderização por categorias */}
        {Object.entries(groupedFunctions).map(([categoryName, categoryFunctions], categoryIndex) => {
        if (categoryFunctions.length === 0) return null;
        const categoryConfig = categoriesConfig[categoryName as keyof typeof categoriesConfig];
        return <div key={categoryName} className="mb-12 animate-fade-in">
              {/* Título da categoria */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <h3 className="text-lg sm:text-xl font-medium text-muted-foreground px-4 py-2 bg-background/50 backdrop-blur-sm rounded-lg">
                  {categoryName}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              {/* Grid de funções da categoria - uma por linha estilo curso preparatório */}
              <div className="space-y-4 mb-8">
                {categoryFunctions.map((func, index) => {
              const Icon = getIconForFunction(func.funcao, func.id);
              const capaFuncao = capasMap[func.funcao] || func.link;
              
              return <Card key={func.id} className="card-legal group cursor-pointer overflow-hidden animate-fade-in hover:animate-legal-float border-0 w-full" onClick={() => handleFunctionClick(func.funcao)} style={{
                animationDelay: `${categoryIndex * 100 + index * 50}ms`
              }}>
                      <CardContent className="p-0 relative">
                        {/* Gradient background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-professional/5 to-red-professional/10 group-hover:from-red-professional/10 group-hover:to-red-professional/20 transition-all duration-500 rounded-lg" />
                        
                        {/* Container com imagem de fundo estilo curso preparatório */}
                        <div 
                          className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
                          style={{
                            backgroundImage: capaFuncao ? `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${capaFuncao})` : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-foreground)))',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* Overlay com conteúdo */}
                          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                            {/* Ícone e título */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                                <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-white mb-1 group-hover:text-white/90 transition-colors duration-500">
                                  {func.funcao}
                                </h3>
                                
                                <p className="text-sm sm:text-base text-white/80 group-hover:text-white/70 transition-colors duration-500 line-clamp-2">
                                  {func.descricao || 'Funcionalidade especializada para estudos jurídicos'}
                                </p>
                              </div>
                              
                              {/* Arrow indicator */}
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-white/30 transition-all duration-300">
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 group-hover:via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                        </div>

                        {/* Professional interactive border effect */}
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-red-professional/30 transition-all duration-500" />
                      </CardContent>
                    </Card>;
            })}
              </div>
            </div>;
      })}

        {functions.length === 0 && <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground text-lg">
              Nenhuma função encontrada. Verifique a configuração da base de dados.
            </p>
          </div>}
      </div>
    </div>;
};
