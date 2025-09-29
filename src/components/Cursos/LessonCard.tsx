import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, Play, ChevronRight, CheckCircle2, BookOpen 
} from 'lucide-react';

interface LessonCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  duration?: number;
  lessonNumber: number;
  progress?: number;
  isCompleted?: boolean;
  isWatched?: boolean;
  onClick: () => void;
  className?: string;
}

export const LessonCard = ({
  title,
  subtitle,
  image,
  duration = 0,
  lessonNumber,
  progress = 0,
  isCompleted = false,
  isWatched = false,
  onClick,
  className = ""
}: LessonCardProps) => {
  return (
    <Card 
      className={`cursor-pointer group hover:shadow-md transition-all duration-200 hover:scale-[1.01] overflow-hidden border-l-4 ${
        isCompleted ? 'border-l-green-500' : isWatched ? 'border-l-blue-500' : 'border-l-border'
      } ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail/Number da Aula */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted relative">
            {image ? (
              <>
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-5 w-5 text-white drop-shadow-lg" />
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{lessonNumber}</span>
              </div>
            )}
          </div>

          {/* Conteúdo da Aula */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-medium">
                Aula {lessonNumber}
              </Badge>
              {isCompleted && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            
            <h3 className="font-semibold text-base truncate mb-1 leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate mb-2">{subtitle}</p>
            )}
            
            <div className="flex items-center gap-4">
              {duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{duration}min</span>
                </div>
              )}
              
              {progress > 0 && (
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {progress}% assistido
                  </span>
                </div>
              )}
            </div>

            {/* Barra de progresso para aulas */}
            {progress > 0 && (
              <div className="mt-2">
                <Progress value={progress} className="h-1" />
              </div>
            )}
          </div>

          {/* Status e ação */}
          <div className="flex items-center gap-2">
             {isCompleted ? (
               <Badge className="bg-success/10 text-success border-success/20">
                 Concluída
               </Badge>
             ) : isWatched ? (
               <Badge className="bg-info/10 text-info border-info/20">
                 Iniciada
               </Badge>
             ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Nova
              </Badge>
            )}
            
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};