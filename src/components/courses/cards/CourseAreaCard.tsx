import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, PlayCircle, Clock, TrendingUp } from 'lucide-react';
import { CursoArea } from '@/hooks/useCursosPreparatorios';

interface CourseAreaCardProps {
  area: CursoArea;
  progress: number;
  onClick: () => void;
}

export const CourseAreaCard = ({ area, progress, onClick }: CourseAreaCardProps) => {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img 
          src={area.capa || '/placeholder.svg'} 
          alt={area.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight">
            {area.nome}
          </h3>
        </div>
        
        {/* Progress badge */}
        <div className="absolute top-4 right-4">
          <Badge 
            variant="secondary" 
            className="bg-black/60 backdrop-blur-sm text-white border-white/20"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {progress}%
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{area.modulos.length} módulos</span>
          </div>
          <div className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" />
            <span>{area.totalAulas} aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.round(area.modulos.reduce((total, mod) => total + (mod.totalDuracao || 0), 0))} min</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          Explore {area.modulos.length} módulos com {area.totalAulas} aulas de conteúdo especializado.
        </p>
      </CardContent>
    </Card>
  );
};