import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { CursoModulo } from '@/hooks/useCursosPreparatorios';

interface CourseModuleCardProps {
  modulo: CursoModulo;
  progress: number;
  onClick: () => void;
  isCompleted?: boolean;
}

export const CourseModuleCard = ({ 
  modulo, 
  progress, 
  onClick, 
  isCompleted = false 
}: CourseModuleCardProps) => {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
      onClick={onClick}
    >
      <div className="relative h-44 overflow-hidden rounded-t-lg">
        <img 
          src={modulo.capa || '/placeholder.svg'} 
          alt={modulo.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Status badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isCompleted && (
            <Badge 
              variant="secondary" 
              className="bg-green-600/80 backdrop-blur-sm text-white border-green-400/20"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Concluído
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className="bg-black/60 backdrop-blur-sm text-white border-white/20"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {progress}%
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-base line-clamp-2 leading-tight">
            {modulo.nome}
          </h3>
        </div>
      </div>

      <CardContent className="p-5 space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" />
            <span>{modulo.aulas.length} aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{modulo.totalDuracao} min</span>
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

        {/* Next lesson preview */}
        {modulo.aulas.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Próxima: {modulo.aulas[0].nome}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};