import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Heart, History, BookOpen, ArrowUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigation } from '@/context/NavigationContext';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface BlogPost {
  id: number;
  "Área": string;
  "Tema": string;
  "Texto": string;
  capa: string;
}

const BloggerJuridico = () => {
  const { setCurrentFunction } = useNavigation();
  const { toast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('Todos');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [readHistory, setReadHistory] = useState<number[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Carregar posts do Supabase
  useEffect(() => {
    const carregarPosts = async () => {
      try {
        console.log('BloggerJuridico - Carregando posts...');
        const { data, error } = await supabase
          .from('BLOGER')
          .select('*')
          .order('id');

        console.log('BloggerJuridico - Dados carregados:', data, 'Erro:', error);

        if (error) throw error;
        setPosts(data || []);

        // Carregar favoritos e histórico
        const favoritosSalvos = localStorage.getItem('blog-favoritos');
        const historicoSalvo = localStorage.getItem('blog-historico');
        
        if (favoritosSalvos) setFavorites(JSON.parse(favoritosSalvos));
        if (historicoSalvo) setReadHistory(JSON.parse(historicoSalvo));
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os artigos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    carregarPosts();
  }, [toast]);

  // Filtrar posts
  const postsFiltrados = useMemo(() => {
    return posts.filter(post => {
      const matchSearch = searchTerm === '' || 
        post["Tema"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post["Texto"]?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchArea = areaFilter === 'Todos' || post["Área"] === areaFilter;
      
      return matchSearch && matchArea;
    });
  }, [posts, searchTerm, areaFilter]);

  // Obter áreas únicas
  const areas = useMemo(() => {
    const uniqueAreas = [...new Set(posts.map(post => post["Área"]))];
    return ["Todos", ...uniqueAreas];
  }, [posts]);

  // Adicionar aos favoritos
  const toggleFavorite = (postId: number) => {
    const newFavorites = favorites.includes(postId)
      ? favorites.filter(id => id !== postId)
      : [...favorites, postId];
    
    setFavorites(newFavorites);
    localStorage.setItem('blog-favoritos', JSON.stringify(newFavorites));
    
    toast({
      title: favorites.includes(postId) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: favorites.includes(postId) ? "Artigo removido da sua lista" : "Artigo salvo na sua lista",
    });
  };

  // Adicionar ao histórico
  const addToHistory = (postId: number) => {
    const newHistory = [postId, ...readHistory.filter(id => id !== postId)].slice(0, 10);
    setReadHistory(newHistory);
    localStorage.setItem('blog-historico', JSON.stringify(newHistory));
  };

  // Abrir artigo
  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    addToHistory(post.id);
    scrollToTop();
  };


  // Obter preview do texto
  const getPreview = (text: string, length = 150) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // Posts relacionados
  const getRelatedPosts = (currentPost: BlogPost) => {
    return posts
      .filter(post => 
        post.id !== currentPost.id && 
        post["Área"] === currentPost["Área"]
      )
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">JusBlog</h1>
          <p className="text-lg text-muted-foreground">Carregando artigos...</p>
        </div>
      </div>
    );
  }

  // Visualização do artigo completo
  if (selectedPost) {
    const relatedPosts = getRelatedPosts(selectedPost);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header do artigo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos artigos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite(selectedPost.id)}
              className={`flex items-center gap-2 ${
                favorites.includes(selectedPost.id) ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${favorites.includes(selectedPost.id) ? 'fill-current' : ''}`} />
              {favorites.includes(selectedPost.id) ? 'Favorito' : 'Favoritar'}
            </Button>
          </div>

          {/* Conteúdo do artigo */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {/* Imagem de capa */}
            {selectedPost.capa && (
              <div className="mb-8">
                <img 
                  src={selectedPost.capa} 
                  alt={selectedPost["Tema"]}
                  className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">{selectedPost["Área"]}</Badge>
              {readHistory.includes(selectedPost.id) && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Lido
                </Badge>
              )}
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">{selectedPost["Tema"]}</h1>

            {/* Conteúdo */}
            <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({children}) => <h1 className="text-3xl font-bold text-primary mb-6 mt-8">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-semibold text-primary mb-4 mt-6">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-semibold text-primary mb-3 mt-5">{children}</h3>,
                  h4: ({children}) => <h4 className="text-lg font-semibold text-primary mb-2 mt-4">{children}</h4>,
                  p: ({children}) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4 ml-4 text-foreground">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4 ml-4 text-foreground">{children}</ol>,
                  li: ({children}) => <li className="mb-2 text-foreground">{children}</li>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 py-2 mb-4 bg-muted italic text-muted-foreground">{children}</blockquote>,
                  code: ({children}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">{children}</code>,
                  pre: ({children}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                  strong: ({children}) => <strong className="font-bold text-primary">{children}</strong>,
                  em: ({children}) => <em className="italic text-accent">{children}</em>,
                  a: ({href, children}) => <a href={href} className="text-primary hover:text-primary/80 underline">{children}</a>,
                  hr: () => <hr className="my-8 border-border" />,
                  table: ({children}) => <table className="w-full border-collapse border border-border mb-4">{children}</table>,
                  th: ({children}) => <th className="border border-border p-2 bg-muted font-semibold text-left">{children}</th>,
                  td: ({children}) => <td className="border border-border p-2">{children}</td>,
                }}
              >
                {selectedPost["Texto"]}
              </ReactMarkdown>
            </div>
          </motion.article>

          {/* Posts relacionados */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-2xl font-bold mb-6">Artigos Relacionados</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map(post => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4" onClick={() => openPost(post)}>
                        {post.capa && (
                          <img 
                            src={post.capa} 
                            alt={post["Tema"]}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <Badge variant="outline" className="mb-2 text-xs">
                          {post["Área"]}
                        </Badge>
                        <h4 className="font-semibold text-sm line-clamp-2">{post["Tema"]}</h4>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Scroll to top button */}
          {showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Button
                onClick={scrollToTop}
                size="icon"
                className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Lista de artigos
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentFunction(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
              JusBlog
            </h1>
            <p className="text-lg text-muted-foreground">
              Artigos especializados em Direito
            </p>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tema ou palavra-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por área" />
            </SelectTrigger>
            <SelectContent>
              {areas.map(area => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Atalhos rápidos */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const favoritePosts = posts.filter(post => favorites.includes(post.id));
              setPosts(favoritePosts.length > 0 ? favoritePosts : posts);
            }}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Favoritos ({favorites.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const recentPosts = posts.filter(post => readHistory.includes(post.id));
              setPosts(recentPosts.length > 0 ? recentPosts : posts);
            }}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Histórico ({readHistory.length})
          </Button>
        </div>

        {/* Lista de artigos */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {postsFiltrados.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0" onClick={() => openPost(post)}>
                  {/* Imagem de capa */}
                  {post.capa && (
                    <div className="relative">
                      <img 
                        src={post.capa} 
                        alt={post["Tema"]}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(post.id);
                        }}
                        className={`absolute top-2 right-2 bg-background/80 backdrop-blur-sm ${
                          favorites.includes(post.id) ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(post.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Área */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary">
                        {post["Área"]}
                      </Badge>
                      {readHistory.includes(post.id) && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          ✓ Lido
                        </Badge>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                      {post["Tema"]}
                    </h3>

                    {/* Preview do texto */}
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {getPreview(post["Texto"])}
                    </p>

                    {/* Indicadores */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>Leitura</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {postsFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Nenhum artigo encontrado com os filtros selecionados.
            </p>
          </div>
        )}

        {/* Scroll to top button */}
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BloggerJuridico;