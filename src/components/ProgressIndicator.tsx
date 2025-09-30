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
    <Card className={`w-full max-w-md mx-auto shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground truncate">
              {label}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-sm font-mono font-bold text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        
        <Progress 
          value={progress} 
          className="h-3 mb-3"
        />
        
        <div className="mt-3 text-sm text-muted-foreground text-center font-medium">
          {progress < 30 && "✨ Iniciando geração de conteúdo..."}
          {progress >= 30 && progress < 60 && "🔄 Processando informações..."}
          {progress >= 60 && progress < 90 && "📝 Finalizando resposta..."}
          {progress >= 90 && "🎉 Quase pronto!"}
        </div>
      </CardContent>
    </Card>
  );
};