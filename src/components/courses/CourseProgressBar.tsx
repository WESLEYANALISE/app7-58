import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

interface CourseProgressBarProps {
  percentage: number;
  completedLessons?: number;
  totalLessons?: number;
  showBadge?: boolean;
  className?: string;
}

export const CourseProgressBar = ({
  percentage,
  completedLessons,
  totalLessons,
  showBadge = true,
  className = ''
}: CourseProgressBarProps) => {
  const isCompleted = percentage >= 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Clock className="h-4 w-4 text-primary" />
          )}
          <span className="text-muted-foreground">
            {isCompleted ? 'Concluído' : 'Em progresso'}
          </span>
        </div>
        
        {showBadge && (
          <Badge 
            variant={isCompleted ? "default" : "secondary"}
            className={isCompleted ? "bg-success" : "bg-primary/20 text-primary"}
          >
            {Math.round(percentage)}%
          </Badge>
        )}
      </div>

      <Progress 
        value={percentage} 
        className="h-2"
      />

      {completedLessons !== undefined && totalLessons !== undefined && (
        <p className="text-xs text-muted-foreground text-center">
          {completedLessons} de {totalLessons} aulas concluídas
        </p>
      )}
    </div>
  );
};
