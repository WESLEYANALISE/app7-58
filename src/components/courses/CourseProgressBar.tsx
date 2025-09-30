import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
  showBadge?: boolean;
}

export const CourseProgressBar = ({ 
  completed, 
  total, 
  percentage,
  showBadge = true 
}: CourseProgressBarProps) => {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completed} de {total} aulas
        </span>
        {showBadge && (
          <Badge variant={percentage === 100 ? "default" : "secondary"}>
            {percentage === 100 ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Concluído
              </>
            ) : (
              <>
                <PlayCircle className="w-3 h-3 mr-1" />
                {Math.round(percentage)}%
              </>
            )}
          </Badge>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
    </motion.div>
  );
};
