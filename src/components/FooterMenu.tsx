import { Scale, Bot, Film, ClipboardList, BookOpen, Headphones } from 'lucide-react';
import { useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
interface FooterMenuProps {
  isVisible?: boolean;
}
export const FooterMenu = ({
  isVisible = true
}: FooterMenuProps) => {
  // Hide when search modal is open
  const isSearchModalOpen = document.body.classList.contains('search-modal-open');
  const [activeItem, setActiveItem] = useState('audioaulas');
  const {
    setCurrentFunction
  } = useNavigation();
  const {
    functions
  } = useAppFunctions();
  const {
    isDesktop
  } = useDeviceDetection();
  const findFunction = (searchTerm: string) => {
    return functions.find(func => func.funcao.toLowerCase().includes(searchTerm.toLowerCase()));
  };
  const menuItems = [{
    id: 'audioaulas',
    title: 'Audioaulas',
    icon: Headphones,
    function: 'Audioaulas',
    color: 'primary'
  }, {
    id: 'vademecum',
    title: 'Vade Mecum',
    icon: Scale,
    function: 'Vade Mecum Digital',
    color: 'info'
  }, {
    id: 'assistenteia',
    title: 'Evelyn IA',
    icon: Bot,
    function: 'Assistente IA Jurídica',
    color: 'special-ai'
  }, {
    id: 'planoestudo',
    title: 'Plano de Estudo',
    icon: ClipboardList,
    function: 'Plano de Estudo',
    color: 'library'
  }, {
    id: 'juriflix',
    title: 'Juriflix',
    icon: Film,
    function: 'Juriflix',
    color: 'community'
  }];
  const getItemStyles = (item: typeof menuItems[0], isActive: boolean) => {
    const baseStyles = "relative flex flex-col items-center py-3 px-3 rounded-xl transition-all duration-300 transform active:scale-95 group min-w-0 flex-1";
    if (isActive) {
      switch (item.color) {
        case 'special-ai':
          return `${baseStyles} text-white bg-gradient-to-br from-red-500 to-red-700 shadow-lg scale-105`;
        case 'community':
          return `${baseStyles} text-white bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg scale-105`;
        case 'info':
          return `${baseStyles} text-white bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg scale-105`;
        case 'library':
          return `${baseStyles} text-white bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg scale-105`;
        default:
          return `${baseStyles} text-primary bg-gradient-to-br from-primary/30 to-accent-legal/30 shadow-lg scale-105 border border-primary/20`;
      }
    } else {
      return `${baseStyles} text-muted-foreground hover:text-primary hover:bg-footer-hover transition-all duration-300`;
    }
  };
  const getIconStyles = (item: typeof menuItems[0], isActive: boolean) => {
    const baseStyles = "relative p-2 rounded-lg transition-all duration-300";
    if (isActive) {
      return `${baseStyles} bg-white/20 scale-110`;
    } else {
      return `${baseStyles} group-hover:bg-primary/20 group-hover:scale-105`;
    }
  };
  const handleItemClick = (item: typeof menuItems[0]) => {
    setActiveItem(item.id);
    if (item.id === 'assistenteia') {
      // Não mudar currentFunction aqui para evitar abrir o chat legado automaticamente
      // Abrir apenas o chat global via evento
      const event = new CustomEvent('openProfessoraChat', {
        detail: { area: 'Direito' }
      });
      window.dispatchEvent(event);
    } else {
      setCurrentFunction(item.function);
    }
  };

  // Hide when search modal is open or not visible
  if (!isVisible || isSearchModalOpen) {
    return null;
  }

  // Desktop version
  if (isDesktop) {
    return <div className="transition-all duration-300 translate-y-0 opacity-100" data-footer-menu>
        <div className="glass-effect-modern rounded-2xl overflow-hidden bg-gradient-to-r from-red-900/20 via-red-800/15 to-red-900/20 border-red-500/20">
          <div className="flex justify-around items-center px-2 py-2">
            {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isProfessoraIA = item.id === 'assistenteia';
            return <button key={item.id} onClick={() => handleItemClick(item)} className={`${getItemStyles(item, isActive)} ${isProfessoraIA ? 'rounded-full w-14 h-14 shadow-2xl shadow-red-500/40' : ''}`} style={{
              animationDelay: `${index * 50}ms`
            }}>
                  {/* Indicador ativo */}
                  {isActive && <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                  
                   {/* Icon container */}
                  <div className={`${getIconStyles(item, isActive)} ${isProfessoraIA ? 'rounded-full' : ''}`}>
                    {isProfessoraIA ? (
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <iframe
                          src="https://lottie.host/embed/4cf4ee37-a511-4357-a3ff-fa2115251444/oXRRrHCU8q.lottie"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            border: 'none',
                            transform: 'scale(1.2)'
                          }}
                          title="Professora IA Animation"
                        />
                      </div>
                    ) : (
                      <Icon className={`${isProfessoraIA ? 'h-6 w-6' : 'h-5 w-5'} transition-all duration-300`} />
                    )}
                  </div>
                  
                  {/* Label - hide for circular Professora IA */}
                  {!isProfessoraIA && (
                    <span className={`text-xs font-medium transition-all duration-300 mt-1 text-center leading-tight ${isActive ? 'font-semibold text-white' : 'group-hover:font-medium'}`}>
                      {item.title}
                    </span>
                  )}
                  
                  {/* Efeito de brilho no hover */}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-xl" />}
                </button>;
          })}
          </div>
        </div>
      </div>;
  }

  // Mobile version - stylish floating menu with uniform sizing
  return <div data-footer-menu className="fixed bottom-4 left-0 right-0 z-50 transition-all duration-300 translate-y-0 opacity-100 px-0 py-0 mx-0 my-0">
      {/* Stylish floating container with enhanced red design */}
      <div className="mx-4 bg-gradient-to-r from-red-900/95 via-red-800/95 to-red-900/95 backdrop-blur-xl border border-red-500/20 rounded-3xl shadow-2xl shadow-red-900/30 overflow-hidden">
        {/* Enhanced container with red gradient background */}
        <div className="relative py-2 px-3">
          {/* Subtle inner red glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />
          
          <div className="relative flex justify-between items-center">
            {/* Uniform grid with consistent spacing */}
            <div className="w-full grid grid-cols-5 gap-1 items-center">
              {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isProfessoraIA = item.id === 'assistenteia';
              return <div key={item.id} className="flex justify-center">
                    <button onClick={() => handleItemClick(item)} className={`
                        relative flex flex-col items-center justify-center
                        ${isProfessoraIA ? 'w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white shadow-2xl shadow-red-500/50 hover:shadow-red-500/70 scale-105 border-2 border-red-400/50' : 'w-16 h-16 rounded-2xl'}
                        transition-all duration-300 transform
                        ${!isProfessoraIA && (isActive ? 'bg-gradient-to-br from-white/20 to-white/10 text-white shadow-lg scale-105 border border-white/20' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:scale-105')}
                        active:scale-95
                        backdrop-blur-sm
                      `} style={{
                  animationDelay: `${index * 100}ms`
                }}>
                      {/* Icon with consistent sizing - compact for circular button */}
                      {isProfessoraIA ? (
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <iframe
                            src="https://lottie.host/embed/4cf4ee37-a511-4357-a3ff-fa2115251444/oXRRrHCU8q.lottie"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              border: 'none',
                              transform: 'scale(1.2)'
                            }}
                            title="Professora IA Animation"
                          />
                        </div>
                      ) : (
                        <Icon className={`
                          ${isProfessoraIA ? 'h-5 w-5' : 'h-6 w-6'} ${!isProfessoraIA && 'mb-1'} transition-all duration-300
                          ${isProfessoraIA ? 'text-white drop-shadow-lg' : 'text-white'}
                        `} />
                      )}
                      
                      {/* Label with consistent styling - hide for circular button */}
                      {!isProfessoraIA && (
                        <span className={`
                          text-[10px] font-medium text-center leading-tight
                          text-white/90 transition-all duration-300
                        `}>
                          {item.title}
                        </span>
                      )}
                      
                      {/* Special glow effect for Professora IA - enhanced for circular */}
                      {isProfessoraIA && <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-red-400/10 rounded-full animate-pulse" />}
                      
                      {/* Active indicator */}
                      {isActive && !isProfessoraIA && <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white/60 rounded-full" />}
                    </button>
                  </div>;
            })}
            </div>
          </div>
        </div>
      </div>
    </div>;
};