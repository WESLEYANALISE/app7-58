import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, SortAsc } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  subtitle?: string;
  totalCount?: number;
  completedCount?: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  showStats?: boolean;
  children?: React.ReactNode;
}

export const CourseHeader = ({
  title,
  subtitle,
  totalCount = 0,
  completedCount = 0,
  searchTerm,
  onSearchChange,
  onBack,
  showStats = true,
  children
}: CourseHeaderProps) => {
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center h-16 px-4 gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>

          {showStats && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {completionPercentage}% completo
              </Badge>
              <Badge variant="secondary">
                {completedCount}/{totalCount}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border-b">
        <div className="p-6">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
            
            {showStats && totalCount > 0 && (
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{totalCount}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{completionPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Progresso</div>
                </div>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos, módulos ou aulas..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-12 text-lg bg-background/50 backdrop-blur-sm border-border/50"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3 w-3 mr-1" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <SortAsc className="h-3 w-3 mr-1" />
                Ordenar
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                Todos
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                Em Progresso
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                Concluídos
              </Button>
            </div>
          </div>

          {/* Custom Content */}
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </>
  );
};