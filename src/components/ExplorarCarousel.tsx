import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Video, Newspaper, Radar, GraduationCap, FileText, Scale, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  function: string;
  orientation: 'vertical' | 'horizontal';
}

interface CategoryCarousel {
  id: string;
  title: string;
  description: string;
  function: string;
  icon: any;
  items: CarouselItem[];
  color: string;
}

export const ExplorarCarousel = () => {
  const [categories, setCategories] = useState<CategoryCarousel[]>([]);
  const [carouselIndices, setCarouselIndices] = useState<{[key: string]: number}>({});
  const { setCurrentFunction, setIsExplorarOpen } = useNavigation();

  // Carregar dados do Supabase por categoria
  useEffect(() => {
    const loadCarouselData = async () => {
      try {
        const categoriesData: CategoryCarousel[] = [];

        // 1. Cursos Preparatórios
        const { data: cursos } = await supabase
          .from('CURSOS-APP-VIDEO')
          .select('*')
          .limit(8);

        if (cursos && cursos.length > 0) {
          const cursosItems = cursos
            .filter(curso => curso.capa)
            .map(curso => ({
              id: `curso-${curso.id}`,
              title: curso.Tema || 'Curso',
              description: curso.Assunto || 'Videoaula especializada',
              image: curso.capa,
              function: 'Cursos Preparatórios',
              orientation: Math.random() > 0.6 ? 'vertical' : 'horizontal' as 'vertical' | 'horizontal'
            }));

          categoriesData.push({
            id: 'cursos',
            title: 'Cursos Preparatórios',
            description: 'Videoaulas completas para concursos e OAB',
            function: 'Cursos Preparatórios',
            icon: GraduationCap,
            items: cursosItems,
            color: 'from-blue-500 to-blue-700'
          });
        }

        // 2. Biblioteca Jurídica
        const { data: livros } = await supabase
          .from('BIBLIOTECA-JURIDICA')
          .select('*')
          .limit(8);

        if (livros && livros.length > 0) {
          const livrosItems = livros
            .filter(livro => livro.imagem)
            .map(livro => ({
              id: `livro-${livro.id}`,
              title: livro.livro || 'Livro Jurídico',
              description: livro.sobre ? livro.sobre.substring(0, 100) + '...' : 'Biblioteca jurídica completa',
              image: livro.imagem,
              function: 'Biblioteca Clássicos',
              orientation: Math.random() > 0.4 ? 'vertical' : 'horizontal' as 'vertical' | 'horizontal'
            }));

          categoriesData.push({
            id: 'biblioteca',
            title: 'Biblioteca Jurídica',
            description: 'Milhares de livros e doutrinas organizadas',
            function: 'Biblioteca Clássicos',
            icon: BookOpen,
            items: livrosItems,
            color: 'from-green-500 to-green-700'
          });
        }

        // 3. Videoaulas
        const { data: videoaulas } = await supabase
          .from('VIDEO-AULAS-DIAS')
          .select('*')
          .limit(6);

        if (videoaulas && videoaulas.length > 0) {
          const videoaulasItems = videoaulas
            .filter(video => video.capa)
            .map(video => ({
              id: `video-${video.id}`,
              title: video.Tema || 'Videoaula',
              description: video.Assunto || 'Aula especializada',
              image: video.capa,
              function: 'Videoaulas',
              orientation: 'horizontal' as 'vertical' | 'horizontal'
            }));

          categoriesData.push({
            id: 'videoaulas',
            title: 'Videoaulas Especializadas',
            description: 'Aulas com professores renomados',
            function: 'Videoaulas',
            icon: Video,
            items: videoaulasItems,
            color: 'from-purple-500 to-purple-700'
          });
        }

        // 4. Biblioteca Fora da Toga
        const { data: foraToga } = await supabase
          .from('BILBIOTECA-FORA DA TOGA')
          .select('*')
          .limit(6);

        if (foraToga && foraToga.length > 0) {
          const foraTogaItems = foraToga
            .filter(item => item['capa-livro'])
            .map(item => ({
              id: `fora-toga-${item.id}`,
              title: item.livro || 'Desenvolvimento Pessoal',
              description: item.sobre ? item.sobre.substring(0, 80) + '...' : 'Crescimento para juristas',
              image: item['capa-livro'],
              function: 'Fora da Toga',
              orientation: Math.random() > 0.5 ? 'vertical' : 'horizontal' as 'vertical' | 'horizontal'
            }));

          categoriesData.push({
            id: 'fora-toga',
            title: 'Fora da Toga',
            description: 'Desenvolvimento pessoal para juristas',
            function: 'Fora da Toga',
            icon: Brain,
            items: foraTogaItems,
            color: 'from-amber-500 to-orange-600'
          });
        }

        // 5. Adicionar funcionalidades sem dados específicos mas com capas
        const functionalityCategories = [
          {
            id: 'blog',
            title: 'Blog Jurídico',
            description: 'Artigos e análises especializadas',
            function: 'Blog Jurídico',
            icon: Newspaper,
            color: 'from-pink-500 to-rose-600'
          },
          {
            id: 'radar',
            title: 'Radar Jurídico',
            description: 'Monitore tendências e mudanças',
            function: 'Radar Jurídico',
            icon: Radar,
            color: 'from-red-500 to-red-700'
          },
          {
            id: 'vademecum',
            title: 'Vade Mecum Digital',
            description: 'Leis e códigos sempre atualizados',
            function: 'Vade Mecum Digital',
            icon: Scale,
            color: 'from-indigo-500 to-blue-600'
          }
        ];

        // Buscar capas de funções para as funcionalidades
        const { data: capasFuncoes } = await supabase
          .from('CAPAS-FUNÇÃO')
          .select('*');

        functionalityCategories.forEach(func => {
          const capasRelacionadas = capasFuncoes?.filter(c => 
            c['Função']?.toLowerCase().includes(func.title.toLowerCase().split(' ')[0])
          ) || [];

          // Se não tiver capas específicas, usar imagens padrão
          const items = capasRelacionadas.length > 0 
            ? capasRelacionadas.map((capa, index) => ({
                id: `${func.id}-${index}`,
                title: func.title,
                description: func.description,
                image: capa.capa,
                function: func.function,
                orientation: Math.random() > 0.5 ? 'vertical' : 'horizontal' as 'vertical' | 'horizontal'
              }))
            : Array.from({ length: 3 }, (_, index) => ({
                id: `${func.id}-${index}`,
                title: func.title,
                description: func.description,
                image: `https://images.unsplash.com/photo-158982954${5 + index}-d10d557cf95f?w=400&h=300&fit=crop`,
                function: func.function,
                orientation: Math.random() > 0.5 ? 'vertical' : 'horizontal' as 'vertical' | 'horizontal'
              }));

          categoriesData.push({
            id: func.id,
            title: func.title,
            description: func.description,
            function: func.function,
            icon: func.icon,
            items,
            color: func.color
          });
        });

        // Filtrar categorias que têm items
        const validCategories = categoriesData.filter(cat => cat.items.length > 0);
        setCategories(validCategories);

        // Inicializar índices dos carrosséis
        const indices: {[key: string]: number} = {};
        validCategories.forEach(cat => {
          indices[cat.id] = 0;
        });
        setCarouselIndices(indices);

      } catch (error) {
        console.error('Erro ao carregar dados do carrossel:', error);
      }
    };

    loadCarouselData();
  }, []);

  const handlePrevious = useCallback((categoryId: string) => {
    setCarouselIndices(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] > 0 ? prev[categoryId] - 1 : 0
    }));
  }, []);

  const handleNext = useCallback((categoryId: string, maxItems: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] < maxItems - 1 ? prev[categoryId] + 1 : maxItems - 1
    }));
  }, []);

  const handleItemClick = useCallback((functionName: string) => {
    setCurrentFunction(functionName);
    setIsExplorarOpen(false);
  }, [setCurrentFunction, setIsExplorarOpen]);

  const handleClose = useCallback(() => {
    setIsExplorarOpen(false);
  }, [setIsExplorarOpen]);

  const getVisibleItems = (items: CarouselItem[], startIndex: number) => {
    const visibleCount = 3; // Mostrar 3 items por vez
    return items.slice(startIndex, startIndex + visibleCount);
  };

  const getItemSize = (orientation: 'vertical' | 'horizontal', index: number) => {
    if (orientation === 'vertical') {
      return 'w-24 h-32'; // Mais estreito e alto
    } else {
      return index === 0 ? 'w-32 h-24' : 'w-28 h-20'; // Primeiro maior, outros menores
    }
  };

  if (categories.length === 0) {
    return (
      <div className="fixed inset-0 bg-background-deep/95 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background-deep/95 backdrop-blur-md z-50 flex flex-col">
      {/* Header minimalista */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Explorar Funcionalidades</h1>
            <p className="text-sm text-muted-foreground">Descubra todas as ferramentas disponíveis</p>
          </div>
        </div>
        <Button 
          onClick={handleClose}
          variant="ghost" 
          size="sm"
          className="rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Lista de carrosséis */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const currentIndex = carouselIndices[category.id] || 0;
          const visibleItems = getVisibleItems(category.items, currentIndex);
          const canGoBack = currentIndex > 0;
          const canGoForward = currentIndex < category.items.length - 3;

          return (
            <div key={category.id} className="space-y-3">
              {/* Header da categoria */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}/20`}>
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{category.title}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>

              {/* Carrossel horizontal */}
              <div className="relative">
                <div className="flex gap-3 overflow-hidden">
                  {visibleItems.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.function)}
                      className={`
                        ${getItemSize(item.orientation, index)}
                        relative overflow-hidden rounded-xl cursor-pointer 
                        shadow-md hover:shadow-lg transition-all duration-300 
                        hover:scale-105 flex-shrink-0
                      `}
                    >
                      {/* Background image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.image})`,
                          filter: 'brightness(0.8) contrast(1.1)'
                        }}
                      />
                      
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${category.color}/60`} />
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-2 flex flex-col justify-end text-white">
                        <h4 className="text-xs font-semibold drop-shadow line-clamp-2">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation arrows */}
                {canGoBack && (
                  <Button
                    onClick={() => handlePrevious(category.id)}
                    variant="outline"
                    size="sm"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 rounded-full bg-background/90 backdrop-blur-sm border-border/50 w-8 h-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}

                {canGoForward && (
                  <Button
                    onClick={() => handleNext(category.id, category.items.length)}
                    variant="outline"
                    size="sm"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 rounded-full bg-background/90 backdrop-blur-sm border-border/50 w-8 h-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {/* Progress indicator */}
                <div className="flex justify-center gap-1 mt-2">
                  {Array.from({ length: Math.ceil(category.items.length / 3) }, (_, index) => (
                    <div
                      key={index}
                      className={`
                        w-1.5 h-1.5 rounded-full transition-all duration-300
                        ${Math.floor(currentIndex / 3) === index 
                          ? 'bg-primary' 
                          : 'bg-muted-foreground/30'
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};