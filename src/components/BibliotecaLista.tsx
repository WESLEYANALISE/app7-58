import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, BookOpen, User, Download, ExternalLink, Filter, X } from 'lucide-react';
import { MobileBookCard } from './MobileBookCard';
import { JuridicalBookCard } from './JuridicalBookCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  'capa-area'?: string;
}
interface BibliotecaListaProps {
  area: string;
  livros: LivroJuridico[];
  onBack: () => void;
  onBookClick: (livro: LivroJuridico) => void;
}
export const BibliotecaLista = ({
  area,
  livros,
  onBack,
  onBookClick
}: BibliotecaListaProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'titulo' | 'autor'>('titulo');
  const [previewBook, setPreviewBook] = useState<LivroJuridico | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Filtrar e ordenar livros
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = livros.filter(livro => livro.livro.toLowerCase().includes(searchTerm.toLowerCase()) || livro.autor && livro.autor.toLowerCase().includes(searchTerm.toLowerCase()) || livro.sobre && livro.sobre.toLowerCase().includes(searchTerm.toLowerCase()));

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'titulo') {
        return a.livro.localeCompare(b.livro);
      } else {
        return (a.autor || '').localeCompare(b.autor || '');
      }
    });
    return filtered;
  }, [livros, searchTerm, sortBy]);
  const handleDownload = (e: React.MouseEvent, livro: LivroJuridico) => {
    e.stopPropagation();
    if (livro.download) {
      window.open(livro.download, '_blank');
    }
  };
  const handleExternalLink = (e: React.MouseEvent, livro: LivroJuridico) => {
    e.stopPropagation();
    if (livro.link) {
      window.open(livro.link, '_blank');
    }
  };
  return <div className="px-2 sm:px-0">
      <div className="space-y-4 sm:space-y-6">
      
      {/* Header da área com capa */}
      <div className="relative mb-6 rounded-xl overflow-hidden">
        {livros[0]?.['capa-area'] ? (
          <img 
            src={livros[0]['capa-area']} 
            alt={area}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-64 bg-gradient-to-br from-secondary/20 to-secondary/30 flex items-center justify-center ${livros[0]?.['capa-area'] ? 'hidden' : ''}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{area}</h2>
            <p className="text-white/80">Biblioteca Clássicos</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2 line-clamp-2">{area}</h1>
          <p className="text-white/80 mb-4">
            {filteredAndSortedBooks.length} {filteredAndSortedBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
          </p>
        </div>
      </div>

      {/* Controles */}
      <div className="space-y-3 sm:space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por título, autor ou descrição..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-11" />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'titulo' | 'autor')} className="bg-background border border-border rounded px-3 py-2 text-sm flex-1 sm:flex-none">
            <option value="titulo">Ordenar por Título</option>
            <option value="autor">Ordenar por Autor</option>
          </select>
        </div>
      </div>

      {/* Lista de livros */}
      {filteredAndSortedBooks.length === 0 ? <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Nenhum livro encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Tente buscar com outros termos ou verifique a ortografia
          </p>
        </div> : <div className="space-y-4">
          {filteredAndSortedBooks.map((livro, index) => <motion.div key={livro.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: index * 0.05
        }}>
              <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary overflow-hidden" onClick={() => navigate(`/book/${livro.id}`, { state: { book: livro } })}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Imagem do livro - responsiva */}
                    <div className="w-16 h-20 sm:w-20 sm:h-28 flex-shrink-0 relative overflow-hidden rounded-lg shadow-sm">
                      {livro.imagem || (livro as any)['capa-livro'] ? <img src={livro.imagem || (livro as any)['capa-livro']} alt={livro.livro} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                        </div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Conteúdo - responsivo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <div className="flex-1 pr-2 sm:pr-4">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">
                            {livro.livro}
                          </h3>
                          
                          {livro.autor && <div className="flex items-center gap-1 text-muted-foreground mb-2">
                              <User className="h-3 w-3" />
                              <span className="text-xs sm:text-sm truncate">{livro.autor}</span>
                            </div>}
                        </div>
                        
                        {/* Botões de ação - responsivos */}
                        
                      </div>
                      
                      {/* Descrição - responsiva */}
                      {livro.sobre && <div className="mb-2 sm:mb-3">
                          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
                            {livro.sobre}
                          </p>
                        </div>}
                      
                      {/* Call to action - responsivo */}
                      <div className="flex items-center justify-end">
                        <div className="flex items-center gap-1 text-primary">
                          <span className="text-xs font-medium">Abrir livro</span>
                          <BookOpen className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
      {previewBook && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setPreviewBook(null)}>
          <motion.div initial={{
          scale: 0.95,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.95,
          opacity: 0
        }} className="bg-background rounded-lg max-w-xs sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="pr-2 sm:pr-4 flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 line-clamp-2">{previewBook.livro}</h2>
                  {previewBook.autor && <p className="text-xs sm:text-sm text-muted-foreground truncate">Autor: {previewBook.autor}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPreviewBook(null)} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-20 h-28 sm:w-28 sm:h-40 flex-shrink-0 rounded-md overflow-hidden shadow mx-auto sm:mx-0">
                  {previewBook.imagem || (previewBook as any)['capa-livro'] ? <img src={previewBook.imagem || (previewBook as any)['capa-livro']} alt={previewBook.livro} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>}
                </div>
                <div className="flex-1">
                  {previewBook.sobre && <div className="mb-4">
                      <h3 className="text-sm sm:text-base font-semibold mb-2">Sobre o livro</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{previewBook.sobre}</p>
                    </div>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4">
                    <Button onClick={() => {
                    onBookClick(previewBook);
                    setPreviewBook(null);
                  }} className="text-sm">
                      Ler agora
                    </Button>
                    {previewBook.download && <Button variant="outline" onClick={() => window.open(previewBook.download!, '_blank')} className="text-sm">
                        Download
                      </Button>}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>
    </div>;
};