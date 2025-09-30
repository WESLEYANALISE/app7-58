import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, X, Calendar, Heart, Eye, EyeOff, SortAsc, SortDesc } from 'lucide-react';
interface NewsFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  selectedFilter: 'all' | 'unread' | 'favorites';
  onFilterChange: (filter: 'all' | 'unread' | 'favorites') => void;
  sortOrder: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
  totalCount: number;
  filteredCount: number;
}
export const NewsFilters = ({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  sortOrder,
  onSortChange,
  totalCount,
  filteredCount
}: NewsFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const filters = [{
    key: 'all' as const,
    label: 'Todas',
    icon: Eye,
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }, {
    key: 'unread' as const,
    label: 'Não Lidas',
    icon: EyeOff,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }, {
    key: 'favorites' as const,
    label: 'Favoritas',
    icon: Heart,
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  }];
  return <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar notícias por título, conteúdo ou portal..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="pl-10 pr-10 bg-card border-border/50 focus:border-yellow-500/50" />
        {searchTerm && <Button variant="ghost" size="sm" onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>}
      </div>

      {/* Quick Filters */}
      

      {/* Results Counter */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredCount} de {totalCount} notícias
          </Badge>
          
          {searchTerm && <Badge variant="outline" className="text-xs">
              Buscando por: "{searchTerm}"
            </Badge>}
          
          {selectedFilter !== 'all' && <Badge variant="outline" className="text-xs">
              Filtro: {filters.find(f => f.key === selectedFilter)?.label}
            </Badge>}
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">Atualizadas automaticamente</span>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
          <h4 className="font-medium text-sm">Filtros Avançados</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Portal
              </label>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Todos os Portais
              </Button>
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Data
              </label>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Últimos 7 dias
              </Button>
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Categoria
              </label>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Todas as Categorias
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(false)}>
              Fechar
            </Button>
            <Button size="sm" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Aplicar Filtros
            </Button>
          </div>
        </div>}
    </div>;
};