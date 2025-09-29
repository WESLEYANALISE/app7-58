import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Users, Award, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
interface ModernCourseLayoutProps {
  title: string;
  onBack: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  showSearch?: boolean;
  stats?: {
    totalAreas?: number;
    totalModulos?: number;
    totalAulas?: number;
  };
  children: ReactNode;
}
export const ModernCourseLayout = ({
  title,
  onBack,
  searchTerm = '',
  onSearchChange,
  showSearch = true,
  stats,
  children
}: ModernCourseLayoutProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2 hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
              <span className="font-medium">Voltar</span>
            </Button>
            <div className="h-6 w-px bg-border/50" />
            <h1 className="text-xl font-bold text-foreground truncate max-w-xs">
              {title}
            </h1>
          </div>

          {showSearch && onSearchChange && <div className="flex-1 max-w-md ml-8">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                <Input type="text" placeholder="Buscar cursos, módulos e aulas..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className={`pl-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-all ${isSearchFocused ? 'ring-2 ring-primary/20' : ''}`} />
              </div>
            </div>}
        </div>

        {/* Stats bar */}
        {stats && <div className="border-t border-border/30 bg-muted/30">
            <div className="px-4 py-3">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {stats.totalAreas && <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">{stats.totalAreas}</span>
                    <span>áreas</span>
                  </div>}
                {stats.totalModulos && <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{stats.totalModulos}</span>
                    <span>módulos</span>
                  </div>}
                {stats.totalAulas && <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">{stats.totalAulas}</span>
                    <span>aulas</span>
                  </div>}
              </div>
            </div>
          </div>}
      </div>

      {/* Content */}
      <div className="p-6 px-0">
        {children}
      </div>
    </div>;
};