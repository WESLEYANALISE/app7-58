import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, PlayCircle, TrendingUp, BookOpen, 
  ChevronRight, Play, CheckCircle2 
} from 'lucide-react';

interface CourseCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  duration?: number;
  totalItems?: number;
  progress?: number;
  isCompleted?: boolean;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const CourseCard = ({
  title,
  subtitle,
  description,
  image,
  duration = 0,
  totalItems = 0,
  progress = 0,
  isCompleted = false,
  onClick,
  className = "",
  variant = 'default'
}: CourseCardProps) => {
  
  // Variant para módulos (mais destaque visual)
  if (variant === 'compact') {
    return (
      <Card 
        className={`cursor-pointer group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted relative">
              <img 
                src={image || '/placeholder.svg'} 
                alt={title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate mb-1">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate mb-2">{subtitle}</p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {duration > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{duration}min</span>
                  </div>
                )}
                {totalItems > 0 && (
                  <div className="flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" />
                    <span>{totalItems}</span>
                  </div>
                )}
                {progress > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                )}
              </div>

              {progress > 0 && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1" />
                </div>
              )}
            </div>

            <div className="flex items-center">
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Image Header otimizada para módulos */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={image || '/placeholder.svg'} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        {/* Badge de tipo no canto superior */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary/90 text-white border-primary/30 backdrop-blur-sm shadow-lg font-semibold">
            MÓDULO
          </Badge>
        </div>
        
        {/* Título sobreposto estilizado para módulos */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-3xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            {title}
          </h3>
          
          {/* Informações em linha - como na referência */}
          <div className="flex items-center justify-between text-white/90 mb-2">
            <div className="flex items-center gap-6">
              {totalItems > 0 && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    {totalItems} {totalItems === 1 ? 'módulo' : 'módulos'}
                  </span>
                </div>
              )}
              {duration > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-sm">{duration} aulas</span>
                </div>
              )}
            </div>
            
             {/* Progresso destacado */}
             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm ${
               progress > 0 
                 ? 'bg-primary/20 text-primary-foreground border border-primary/30' 
                 : 'bg-muted/30 text-muted-foreground'
             }`}>
              <TrendingUp className="w-3 h-3" />
              <span className="font-bold text-sm">{progress}%</span>
            </div>
          </div>
          
          {/* Barra de progresso na parte inferior */}
           {progress > 0 && (
             <div className="w-full bg-white/20 rounded-full h-1.5 backdrop-blur-sm">
               <div 
                 className="bg-gradient-to-r from-primary to-primary/80 rounded-full h-1.5 transition-all duration-700 shadow-sm" 
                 style={{ width: `${progress}%` }} 
               />
             </div>
           )}
        </div>

        {/* Status badges no canto superior */}
        <div className="absolute top-4 right-4 flex gap-2">
           {isCompleted && (
             <Badge className="bg-success/90 text-white border-success/30 backdrop-blur-sm shadow-lg">
               <CheckCircle2 className="w-3 h-3 mr-1" />
               Concluído
             </Badge>
           )}
        </div>

        {/* Play Button Overlay otimizado */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-2xl group-hover:scale-110 transition-transform duration-200">
            <Play className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Content mais detalhado */}
      <CardContent className="p-6">
        {subtitle && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-foreground mb-2">{subtitle}</h4>
          </div>
        )}
        
        {/* Descrição expandida e mais detalhada */}
        <div className="space-y-4">
          {description && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          )}
          
          {/* Informações detalhadas do curso */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Conteúdo</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{totalItems} módulos</p>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <PlayCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Duração</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{duration} aulas</p>
              </div>
            </div>
            
            {/* Informações adicionais detalhadas */}
            <div className="bg-gradient-to-r from-background to-muted/20 rounded-lg p-4 border border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Progresso do Módulo</p>
                  <p className="text-lg font-bold text-primary">{progress}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-medium">
                    {isCompleted ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Concluído
                      </span>
                    ) : progress > 0 ? (
                      <span className="text-primary">Em andamento</span>
                    ) : (
                      <span className="text-muted-foreground">Não iniciado</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Clique para continuar seus estudos
            </div>
            <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};