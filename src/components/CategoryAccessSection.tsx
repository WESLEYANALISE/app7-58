import { GraduationCap, Library, Wrench, Target, ChevronRight, Newspaper, Play, Radar } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useState, memo, useMemo, useCallback, useEffect } from 'react';
import { CategoryDialog } from './CategoryDialog';
import { useAuth } from '@/context/AuthContext';
import { SearchBar } from '@/components/SearchBar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import categoriaJustica from '@/assets/categoria-justica.png';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryAccessSection = memo(() => {
  const {
    setCurrentFunction
  } = useNavigation();
  const {
    isTablet,
    isMobile
  } = useDeviceDetection();
  const {
    profile
  } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[0] | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const motivationalMessages = useMemo(() => [
    "Vai estudar, seu preguiçoso! 📚",
    "Revisão é a chave do sucesso! 🔑",
    "Menos procrastinação, mais dedicação! ⏰",
    "Tchau Netflix, olá livros! 👋",
    "Foco nos estudos, não no celular! 📵",
    "Seu futuro agradece seu esforço! 🎓",
    "OAB não vai passar sozinha! 💼",
    "Concurso é para quem estuda, não sonha! 💪",
    "Cada página lida é um passo a mais! 👣",
    "Resumo feito? Flashcard criado? 🃏",
    "Desligue o TikTok e abra o Código! 📖",
    "A aprovação não vai cair do céu! ☁️",
    "Questões de ontem resolvidas? 🤔",
    "Domingo de estudo vale ouro! 💎",
    "Café + Livro = Aprovação! ☕",
    "Parou de estudar? Tá errado! 🚫",
    "Seu concorrente está estudando agora! 🏃",
    "Instagram pode esperar, estude! 📱",
    "Doutrina não se lê sozinha! 📕",
    "Meta de hoje cumprida? 🎯",
    "Menos desculpas, mais disciplina! 💪",
    "Jurisprudência não vai se decorar! ⚖️",
    "Acordou? Então estude! ☀️",
    "Sono? Toma café e vai estudar! ☕",
    "Feriado é dia de estudar também! 🗓️",
    "Sua nomeação depende de hoje! 📜",
    "Posse no cargo ou na preguiça? 🤔",
    "Edital saiu, e você aí parado! 📢",
    "Vade Mecum não vai se ler sozinho! ⚖️",
    "Simulado feito hoje é aprovação amanhã! ✅"
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 10000); // Troca a cada 10 segundos

    return () => clearInterval(interval);
  }, [motivationalMessages.length]);
  const categories = useMemo(() => [{
    id: 1,
    title: 'Estudar Agora',
    description: 'Comece seus estudos de forma prática',
    icon: GraduationCap,
    color: 'from-red-700 to-red-900',
    bgImage: categoriaJustica,
    functions: ['Cursos Preparatórios', 'Resumos Jurídicos', 'Flashcards', 'Mapas Mentais', 'Plano de estudo']
  }, {
    id: 2,
    title: 'Biblioteca e Leituras',
    description: 'Acesse conteúdos e materiais completos',
    icon: Library,
    color: 'from-red-600 to-red-800',
    bgImage: categoriaJustica,
    functions: ['Biblioteca Clássicos', 'Fora da Toga', 'Biblioteca de Estudos', 'Biblioteca Concurso Público', 'Biblioteca Exame da Ordem - OAB', 'Indicações de Livros']
  }, {
    id: 3,
    title: 'Minhas Ferramentas',
    description: 'Utilize recursos para organizar e facilitar',
    icon: Wrench,
    color: 'from-red-500 to-red-700',
    bgImage: categoriaJustica,
    functions: ['Assistente Evelyn', 'Vade Mecum Digital', 'Plataforma Desktop', 'Notícias Comentadas', 'Videoaulas', 'Radar Jurídico', 'Blog Jurídico', 'Artigos Comentados', 'Redação Perfeita', 'Áudio-aulas', 'Petições']
  }, {
    id: 4,
    title: 'Simulado e Questões',
    description: 'Treine e avalie seu conhecimento adquirido',
    icon: Target,
    color: 'from-red-800 to-red-950',
    bgImage: categoriaJustica,
    functions: ['Banco de Questões', 'Simulados OAB']
  }], []);
  const handleCategoryClick = useCallback((category: typeof categories[0]) => {
    setSelectedCategory(category);
  }, []);
  const handleFunctionSelect = useCallback((functionName: string) => {
    console.log('CategoryAccessSection - Selecionando função:', functionName);
    setCurrentFunction(functionName);
    setSelectedCategory(null);
  }, [setCurrentFunction]);

  // Helper function to render category title with proper line breaks
  const renderCategoryTitle = (title: string) => {
    switch (title) {
      case 'Minhas Ferramentas':
        return <div className="text-center">
            <div>Minhas</div>
            <div>Ferramentas</div>
          </div>;
      case 'Biblioteca e Leituras':
        return <div className="text-center">
            <div>Biblioteca e</div>
            <div>Leituras</div>
          </div>;
      default:
        return <div className="text-center">{title}</div>;
    }
  };
  return <>
    <div className={`${isTablet ? 'px-2 mx-2 mb-4 pt-6' : 'px-3 sm:px-4 mx-3 sm:mx-4 mb-6 pt-8'} relative`} style={{
      background: 'linear-gradient(135deg, hsl(var(--red-elegant-dark)) 0%, hsl(var(--red-elegant)) 50%, hsl(var(--red-elegant-darkest)) 100%)',
      borderRadius: '0 0 2rem 2rem'
     }}>

        {/* Header Section - Animação Lottie Centralizada com Botões */}
        <div className="text-center mb-2">
          {/* Mensagens Motivacionais Flutuantes */}
          <div className="relative mb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="inline-block bg-white/95 backdrop-blur-sm text-red-800 px-3 py-1.5 rounded-xl shadow-md border border-red-200 font-medium text-xs relative"
              >
                {motivationalMessages[currentMessageIndex]}
                {/* Balão de fala - seta apontando para baixo */}
                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/95"></div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full max-w-md mx-auto relative flex items-center justify-center">
            {/* Botão Curso - Lado Esquerdo */}
            <button 
              onClick={() => handleFunctionSelect('Cursos Preparatórios')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group flex flex-col items-center"
            >
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 mb-1" />
              <span className="text-xs font-medium">Cursos</span>
            </button>
            
            {/* Animação Lottie Central */}
            <iframe 
              src="https://lottie.host/embed/4801f3f0-7d55-4e49-b808-02032f215495/yAzqvAcH2m.lottie" 
              className="w-full h-32 border-0" 
              title="Animação de Justiça" 
            />
            
            {/* Botão Jusblog - Lado Direito */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group flex flex-col items-center">
                  <Newspaper className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 mb-1" />
                  <span className="text-xs font-medium">Jusblog</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-background border border-border">
                <DropdownMenuItem 
                  onClick={() => handleFunctionSelect('Blog Jurídico')}
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                  <Newspaper className="h-4 w-4 mr-3" />
                  <div className="flex flex-col">
                    <span className="font-medium">Jusblog</span>
                    <span className="text-sm text-muted-foreground">Blog jurídico com artigos e análises</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleFunctionSelect('Radar Jurídico')}
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                  <Radar className="h-4 w-4 mr-3" />
                  <div className="flex flex-col">
                    <span className="font-medium">Radar Jurídico</span>
                    <span className="text-sm text-muted-foreground">Acompanhe as últimas notícias jurídicas</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Categories Grid */}
        <div className={`${isMobile ? 'grid grid-cols-2 gap-4 max-w-sm mx-auto' : isTablet ? 'grid grid-cols-2 gap-6 max-w-2xl mx-auto' : 'grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'}`}>
          {categories.map((category, index) => {
          const Icon = category.icon;
          return <div key={category.id} onClick={() => handleCategoryClick(category)} style={{
            animationDelay: `${index * 150}ms`,
            backgroundImage: `linear-gradient(135deg, hsl(var(--red-elegant-darkest) / 0.95), hsl(var(--red-elegant-dark) / 0.9)), url(${category.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} className={`
                  group cursor-pointer transition-all duration-300 hover:scale-[1.02] 
                  rounded-2xl 
                  ${isMobile ? 'p-4 h-44' : isTablet ? 'p-5 h-48' : 'p-6 h-52'} 
                  flex flex-col justify-between shadow-lg hover:shadow-xl
                  animate-fade-in-up relative overflow-hidden
                `}>
                {/* Icon and Title */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`
                    ${isMobile ? 'w-12 h-12 mb-3' : isTablet ? 'w-14 h-14 mb-3' : 'w-16 h-16 mb-4'}
                    bg-white/20 rounded-xl flex items-center justify-center
                    group-hover:bg-white/30 transition-colors duration-300
                  `}>
                    <Icon className={`${isMobile ? 'w-6 h-6' : isTablet ? 'w-7 h-7' : 'w-8 h-8'} text-white`} />
                  </div>
                  
                  <h3 className={`${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} font-semibold text-white mb-2 leading-tight`}>
                    {renderCategoryTitle(category.title)}
                  </h3>
                </div>

                {/* Description */}
                <div className="text-center flex-1 flex items-center mb-3">
                  <p className={`${isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm'} text-white/90 leading-tight text-center w-full`}>
                    {category.description}
                  </p>
                </div>

                {/* Arrow indicator - positioned in bottom right */}
                <div className="absolute bottom-3 right-3">
                  <div className="w-6 h-6 text-white/70 group-hover:text-white transition-all duration-300 group-hover:scale-110 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>;
        })}
        </div>

        {/* Search Bar */}
        <div className="mt-8 mb-4">
          <SearchBar />
        </div>
      </div>

      {/* Category Dialog */}
      <CategoryDialog category={selectedCategory} open={selectedCategory !== null} onOpenChange={open => !open && setSelectedCategory(null)} onFunctionSelect={handleFunctionSelect} />
    </>;
});
CategoryAccessSection.displayName = 'CategoryAccessSection';
export { CategoryAccessSection };