import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface LivroEstudos {
  id: number;
  area: string;
  ordem: string;
  tema: string;
  download: string;
  link: string;
  capaArea: string;
  capaAreaLink: string;
  capaLivro: string;
  capaLivroLink: string;
  sobre: string;
}

interface BibliotecaListaEstudosProps {
  area: string;
  livros: LivroEstudos[];
  onBack: () => void;
  onItemClick: (livro: LivroEstudos) => void;
}

export const BibliotecaListaEstudos = ({ area, livros, onBack, onItemClick }: BibliotecaListaEstudosProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ordem');
  const isMobile = useIsMobile();

  // Capa da área para o header (pega a primeira disponível no grupo)
  const capaAreaHeader = livros.find(l => l.capaAreaLink && l.capaAreaLink.trim())?.capaAreaLink || '';

  // Filtrar e ordenar livros
  const filteredAndSortedLivros = livros
    .filter(livro => 
      livro.tema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.sobre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livro.ordem?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'ordem':
          const ordemA = parseInt(a.ordem) || 0;
          const ordemB = parseInt(b.ordem) || 0;
          return ordemA - ordemB;
        case 'titulo':
          return (a.tema || '').localeCompare(b.tema || '');
        case 'recente':
          return (b.id || 0) - (a.id || 0);
        default:
          return 0;
      }
    });
  if (livros.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Nenhum material encontrado
        </h3>
        <p className="text-sm text-muted-foreground">
          Esta área ainda não possui materiais disponíveis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da área com capa */}
      <div className="relative mb-6 rounded-xl overflow-hidden">
        {capaAreaHeader ? (
          <img 
            src={capaAreaHeader} 
            alt={area}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-64 bg-gradient-to-br from-secondary/20 to-secondary/30 flex items-center justify-center ${capaAreaHeader ? 'hidden' : ''}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">{area}</h2>
            <p className="text-white/80">Biblioteca de Estudos</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2 line-clamp-2">{area}</h1>
          <p className="text-white/80 mb-4">
            {livros.length} {livros.length === 1 ? 'material disponível' : 'materiais disponíveis'}
          </p>
        </div>
      </div>

      {/* Controles de busca e filtro */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ordem">Ordenar por Ordem</SelectItem>
              <SelectItem value="titulo">Ordenar por Título</SelectItem>
              <SelectItem value="recente">Mais Recentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de materiais */}
      {filteredAndSortedLivros.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Nenhum material encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Tente buscar com outros termos ou ajustar os filtros
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredAndSortedLivros.map((livro, index) => (
            <motion.div
              key={livro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {isMobile ? (
                <div
                  className="cursor-pointer"
                  onClick={() => onItemClick(livro)}
                >
                  <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-3 p-4">
                      {/* Imagem */}
                      <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0 shadow-sm border border-border/20">
                        {livro.capaLivroLink && livro.capaLivroLink.trim() ? (
                          <img
                            src={livro.capaLivroLink}
                            alt={livro.tema}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ${livro.capaLivroLink && livro.capaLivroLink.trim() ? 'hidden' : ''}`}>
                          <BookOpen className="h-4 w-4 text-primary/80" />
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="mb-1 text-xs font-mono bg-primary/10 text-primary border-primary/20">
                          #{parseInt(livro.ordem) || index + 1}
                        </Badge>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {livro.tema}
                        </h3>
                        {livro.sobre && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {livro.sobre}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                  onClick={() => onItemClick(livro)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Imagem */}
                      <div className="w-24 h-32 rounded overflow-hidden flex-shrink-0 shadow-sm border border-border/20">
                        {livro.capaLivroLink && livro.capaLivroLink.trim() ? (
                          <img
                            src={livro.capaLivroLink}
                            alt={livro.tema}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ${livro.capaLivroLink && livro.capaLivroLink.trim() ? 'hidden' : ''}`}>
                          <BookOpen className="h-6 w-6 text-primary/80" />
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2 text-xs font-mono bg-primary/10 text-primary border-primary/20">
                          #{parseInt(livro.ordem) || index + 1}
                        </Badge>
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {livro.tema}
                        </h3>
                        {livro.sobre && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {livro.sobre}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};