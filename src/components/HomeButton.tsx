import React, { memo } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HomeButtonProps {
  variant?: 'home' | 'back';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  position?: 'left' | 'right';
}

const HomeButton = memo<HomeButtonProps>(({ 
  variant = 'home',
  size = 'sm',
  className,
  showLabel = false,
  position = 'right'
}) => {
  const { setCurrentFunction, currentFunction } = useNavigation();

  const handleClick = () => {
    // Reset completo do estado da aplicação
    setCurrentFunction(null);
    
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Limpar localStorage relacionado à navegação se necessário
    sessionStorage.removeItem('lastFunction');
    sessionStorage.removeItem('lastPosition');
  };

  const Icon = variant === 'home' ? Home : ArrowLeft;
  const label = variant === 'home' ? 'Início' : 'Voltar';
  const ariaLabel = variant === 'home' ? 'Voltar ao início' : 'Voltar';

  // Não mostrar se já estamos na home
  if (!currentFunction && variant === 'home') {
    return null;
  }

  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2.5'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn(
      'flex items-center gap-2',
      position === 'right' ? 'ml-auto' : 'mr-auto',
      className
    )}>
      <Button
        onClick={handleClick}
        variant="ghost"
        size="sm"
        className={cn(
          'transition-all duration-200 hover:scale-105 active:scale-95',
          'bg-background/80 hover:bg-primary/10 border border-border/50',
          'text-muted-foreground hover:text-primary',
          'backdrop-blur-sm shadow-sm hover:shadow-md',
          sizeClasses[size]
        )}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <Icon className={cn(
          'transition-colors duration-200',
          iconSizes[size]
        )} />
      </Button>
      
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
          {label}
        </span>
      )}
    </div>
  );
});

HomeButton.displayName = 'HomeButton';

export default HomeButton;