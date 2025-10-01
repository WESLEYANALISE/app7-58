import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Lightbulb } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number;
  label: string;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  label,
  className = ''
}) => {
  const isExplanation = label.toLowerCase().includes('explicação');
  const Icon = isExplanation ? Brain : Lightbulb;
  
  return (
    <Card className={`w-80 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {label}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        
        <Progress 
          value={progress} 
          className="h-2"
        />
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {progress < 30 && "Iniciando geração de conteúdo..."}
          {progress >= 30 && progress < 60 && "Processando informações..."}
          {progress >= 60 && progress < 90 && "Finalizando resposta..."}
          {progress >= 90 && "Quase pronto!"}
        </div>
      </CardContent>
    </Card>
  );
};