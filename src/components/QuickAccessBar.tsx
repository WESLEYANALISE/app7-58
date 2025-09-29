
import { Scale, Bot, Monitor, Headphones, GraduationCap } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { memo, useMemo, useCallback, useState } from 'react';

const QuickAccessBar = memo(() => {
  const { setCurrentFunction } = useNavigation();
  const { isMobile, isTablet } = useDeviceDetection();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const quickAccessItems = useMemo(() => [
    {
      id: 1,
      title: 'Vade Mecum',
      icon: Scale,
      functionName: 'Vade Mecum Digital',
      color: 'from-blue-500 to-blue-600',
      hoverGlow: 'hover:shadow-blue-500/30'
    },
    {
      id: 2, 
      title: 'Assistente IA',
      icon: Bot,
      functionName: 'Assistente IA Jurídica',
      color: 'from-purple-500 to-violet-600',
      hoverGlow: 'hover:shadow-purple-500/30'
    },
    {
      id: 3,
      title: 'Plataforma Desktop',
      icon: Monitor, 
      functionName: 'Plataforma Desktop',
      color: 'from-emerald-500 to-green-600',
      hoverGlow: 'hover:shadow-emerald-500/30'
    },
    {
      id: 4,
      title: 'Áudio-aulas',
      icon: Headphones,
      functionName: 'Áudio-aulas',
      color: 'from-orange-500 to-amber-600',
      hoverGlow: 'hover:shadow-orange-500/30'
    },
    {
      id: 5,
      title: 'Cursos Jurídicos',
      icon: GraduationCap,
      functionName: 'Cursos Preparatórios',
      color: 'from-teal-500 to-cyan-600',
      hoverGlow: 'hover:shadow-teal-500/30'
    }
  ], []);

  const handleItemClick = useCallback((item: typeof quickAccessItems[0]) => {
    setCurrentFunction(item.functionName);
  }, [setCurrentFunction]);

  return (
    <div className={`${isTablet ? 'px-2 mx-2 mb-6 pt-4' : 'px-3 sm:px-4 mx-3 sm:mx-4 mb-8 pt-6'} animate-fade-in-up`}>
      {/* Header com animação elegante - ajustado espaçamento superior */}
      <div className="text-center mb-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-2 animate-stagger-fade">
          Acesso Rápido
        </h3>
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent-legal mx-auto rounded-full animate-scale-in" 
             style={{ animationDelay: '200ms' }} />
      </div>

      {/* Layout de ícones circulares com animações melhoradas */}
      <div className={`${
        isMobile 
          ? 'flex justify-center gap-4 overflow-x-auto pb-2 px-2' 
          : isTablet 
            ? 'flex justify-center gap-6' 
            : 'flex justify-center gap-8'
      }`}>
        {quickAccessItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ animationDelay: `${index * 150}ms` }}
            className={`group cursor-pointer will-change-transform animate-stagger-fade ${
              isMobile ? 'flex-shrink-0' : ''
            }`}
          >
            {/* Container de ícone circular melhorado */}
            <div className={`
              ${isMobile ? 'w-14 h-14' : isTablet ? 'w-15 h-15' : 'w-18 h-18'}
              bg-primary rounded-full flex items-center justify-center
              shadow-lg group-hover:shadow-2xl transition-all duration-500 mb-3 mx-auto
              border-2 border-primary/20 group-hover:border-primary/60
              relative overflow-hidden
              ${hoveredId === item.id ? 'animate-pulse-glow' : ''}
              ${item.hoverGlow}
              transform group-hover:scale-110 group-active:scale-95
            `}>
              {/* Efeito de brilho morphing */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent-legal/30 
                             opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-morphing-bg" />
              
              {/* Ícone com animações aprimoradas */}
              <item.icon className={`${
                isMobile ? 'w-6 h-6' : isTablet ? 'w-7 h-7' : 'w-8 h-8'
              } text-primary-foreground relative z-10 transition-all duration-300
              group-hover:animate-wiggle group-hover:drop-shadow-lg`} />
              
              {/* Ripple effect no clique */}
              <div className="absolute inset-0 bg-primary/20 rounded-full scale-0 
                             group-active:scale-100 transition-transform duration-200" />
            </div>
            
            {/* Label do texto melhorado */}
            <p className={`${
              isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm'
            } font-medium text-center text-foreground leading-tight 
            transition-all duration-300 ${
              isMobile ? 'max-w-[64px]' : 'max-w-[80px]'
            } group-hover:text-primary group-hover:scale-105 
            ${hoveredId === item.id ? 'animate-bounce-soft' : ''}`}>
              {item.title}
            </p>
            
            {/* Indicador de hover sutil */}
            <div className={`w-2 h-2 rounded-full bg-primary mx-auto mt-1 
                           transition-all duration-300 transform
                           ${hoveredId === item.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
          </div>
        ))}
      </div>
      
      {/* Decoração inferior sutil */}
      <div className="flex justify-center mt-6 animate-fade-in" style={{ animationDelay: '800ms' }}>
        <div className="flex gap-2">
          {quickAccessItems.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                hoveredId === index + 1 ? 'bg-primary scale-125' : 'bg-primary/30 scale-100'
              }`}
              style={{ animationDelay: `${900 + index * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

QuickAccessBar.displayName = 'QuickAccessBar';

export { QuickAccessBar };
