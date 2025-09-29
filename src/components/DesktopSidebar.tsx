import { 
  Scale, Bot, Library, Headphones, Brain, Monitor, 
  ChevronLeft, ChevronRight, Home, Star, Play, FileText, Newspaper, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/context/NavigationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { useMemo, useCallback } from 'react';

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const DesktopSidebar = ({ collapsed, onToggle }: DesktopSidebarProps) => {
  const { setCurrentFunction } = useNavigation();
  const { functions, loading } = useAppFunctions();

  const getFunctionName = useCallback((searchTerms: string[]) => {
    console.log('DesktopSidebar - Buscando função para termos:', searchTerms);
    
    if (!functions || functions.length === 0) {
      console.log('DesktopSidebar - Nenhuma função disponível, usando termo padrão');
      return searchTerms[0];
    }
    
    // Primeiro, correspondência exata
    for (const term of searchTerms) {
      const exactMatch = functions.find(func => 
        func.funcao.toLowerCase() === term.toLowerCase()
      );
      if (exactMatch) {
        console.log(`DesktopSidebar - Correspondência exata encontrada para "${term}":`, exactMatch.funcao);
        return exactMatch.funcao;
      }
    }
    
    // Correspondência parcial
    for (const term of searchTerms) {
      const partialMatch = functions.find(func => 
        func.funcao.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(func.funcao.toLowerCase())
      );
      if (partialMatch) {
        console.log(`DesktopSidebar - Correspondência parcial encontrada para "${term}":`, partialMatch.funcao);
        return partialMatch.funcao;
      }
    }
    
    console.log(`DesktopSidebar - Nenhuma correspondência encontrada, usando primeiro termo:`, searchTerms[0]);
    return searchTerms[0];
  }, [functions]);

  const menuSections = useMemo(() => [
    {
      title: 'Principal',
      items: [
        { icon: Home, title: 'Dashboard', function: 'Dashboard' },
      ]
    },
    {
      title: 'Ferramentas Jurídicas',
      items: [
        { 
          icon: Scale, 
          title: 'Vade Mecum Digital', 
          function: getFunctionName(['Vade Mecum Digital'])
        },
        { 
          icon: Bot, 
          title: 'Assistente IA Jurídica', 
          function: getFunctionName(['Assistente IA Jurídica'])
        },
        { 
          icon: Library, 
          title: 'Biblioteca Jurídica', 
          function: getFunctionName(['Biblioteca Jurídica'])
        },
        { 
          icon: Brain, 
          title: 'Mapas Mentais', 
          function: 'Mapas Mentais'
        },
      ]
    },
    {
      title: 'Estudos e Preparação',
      items: [
        { 
          icon: Brain, 
          title: 'Flashcards', 
          function: getFunctionName(['Flashcards'])
        },
        { 
          icon: Play, 
          title: 'Videoaulas', 
          function: 'Videoaulas'
        },
        { 
          icon: Headphones, 
          title: 'Áudio-aulas', 
          function: getFunctionName(['Áudio-aulas'])
        },
        { 
          icon: Download, 
          title: 'Downloads', 
          function: 'Downloads'
        },
        { 
          icon: Newspaper, 
          title: 'Notícias Jurídicas', 
          function: 'Notícias Jurídicas'
        },
        { 
          icon: FileText, 
          title: 'Anotações', 
          function: 'Anotações'
        },
      ]
    }
  ], [functions, getFunctionName]);

  const handleItemClick = useCallback((functionName: string, title: string) => {
    console.log('DesktopSidebar - Clicando no item:', title);
    console.log('DesktopSidebar - Function name:', functionName);
    
    const targetFunction = functionName || title;
    console.log('DesktopSidebar - Navegando para:', targetFunction);
    setCurrentFunction(targetFunction);
  }, [setCurrentFunction]);

  if (loading) {
    return (
      <div className={`fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-72'
      }`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Header simples */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <img 
                  src="https://imgur.com/zlvHIAs.png" 
                  alt="Direito Premium" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Direito Premium</h2>
                <p className="text-xs text-muted-foreground">Plataforma Jurídica</p>
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Menu simples sem animações */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-3">
                  {section.title}
                </h3>
              )}
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  
                  console.log(`DesktopSidebar - Renderizando item ${item.title}: function=${item.function}`);
                  
                  return (
                    <button
                      key={item.title}
                      onClick={() => handleItemClick(item.function, item.title)}
                      className={`w-full flex items-center gap-3 h-10 px-3 rounded-lg text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
                        collapsed ? 'justify-center px-0' : 'justify-start'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      
                      {!collapsed && (
                        <span className="text-sm font-medium truncate">
                          {item.title}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
