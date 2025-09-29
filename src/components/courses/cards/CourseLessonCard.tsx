import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { CursoAula } from '@/hooks/useCursosPreparatorios';
import { Button } from '@/components/ui/button';

interface CourseLessonCardProps {
  aula: CursoAula;
  lessonNumber: number;
  progress: number;
  isCompleted?: boolean;
  isWatched?: boolean;
  onClick: () => void;
}

export const CourseLessonCard = ({ 
  aula, 
  lessonNumber,
  progress, 
  onClick,
  isCompleted = false,
  isWatched = false
}: CourseLessonCardProps) => {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-md hover:shadow-primary/10 transition-all duration-300 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Thumbnail */}
          <div className="relative w-32 h-20 flex-shrink-0 overflow-hidden rounded-l-lg">
            <img 
              src={aula.capa || '/placeholder.svg'} 
              alt={aula.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full w-8 h-8 p-0 bg-white/90 hover:bg-white text-black"
              >
                <Play className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Lesson number */}
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className="bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5"
              >
                {lessonNumber}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                  {aula.nome}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {aula.tema}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1 ml-2">
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {isWatched && !isCompleted && (
                  <PlayCircle className="w-4 h-4 text-primary" />
                )}
              </div>
            </div>

            {/* Progress and duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{aula.duracao}min</span>
                </div>
                <span>{progress}% assistido</span>
              </div>
              
              {progress > 0 && (
                <Progress value={progress} className="h-1" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};