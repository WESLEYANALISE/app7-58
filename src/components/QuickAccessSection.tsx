import { Bot, Scale, Monitor, Headphones, Pencil, BookOpen, FileText } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useState, memo, useMemo, useCallback } from 'react';
import { LibrarySelectionDialog } from './LibrarySelectionDialog';
const QuickAccessSection = memo(() => {
  const { setCurrentFunction } = useNavigation();
  const { isTablet, isMobile } = useDeviceDetection();
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  
  const quickItems = useMemo(() => [{
    id: 1,
    title: 'Explorar Biblioteca',
    active: true,
    icon: Scale,
    functionName: 'Biblioteca Clássicos',
    color: 'from-blue-500 to-blue-600'
  }, {
    id: 2,
    title: 'Notícias Comentadas',
    active: true,
    icon: FileText,
    functionName: 'Notícias Comentadas',
    color: 'from-teal-500 to-emerald-500'
  }, {
    id: 3,
    title: 'Indicações de Livros',
    active: true,
    icon: BookOpen,
    functionName: 'Indicações de Livros',
    color: 'from-amber-500 to-orange-500'
  }, {
    id: 4,
    title: 'Artigos Comentados',
    active: true,
    icon: Headphones,
    functionName: 'Artigos Comentados',
    color: 'from-purple-500 to-pink-500'
  }], []);

  const handleItemClick = useCallback((item: typeof quickItems[0]) => {
    if (item.active) {
      if (item.id === 1) {
        setLibraryDialogOpen(true);
      } else {
        setCurrentFunction(item.functionName);
      }
    }
  }, [setCurrentFunction]);
  return (
    <>
      <div className={`${isTablet ? 'px-2 mx-2 mb-4' : 'px-3 sm:px-4 mx-3 sm:mx-4 mb-6'}`}>
        {/* Grid de itens - 2x2 no mobile, horizontal no desktop */}
        <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : isTablet ? 'grid grid-cols-2 gap-4' : 'flex justify-center gap-6'} ${isMobile ? 'max-w-sm mx-auto' : ''}`}>
          {quickItems.map((item, index) => <div key={item.id} onClick={() => handleItemClick(item)} style={{
          animationDelay: `${index * 100}ms`
        }} className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r ${item.color} rounded-2xl ${isMobile ? 'p-4 h-20 w-full' : isTablet ? 'p-5 h-24 w-full' : 'p-6 h-28 w-[200px]'} flex items-center shadow-lg hover:shadow-xl`}>
              {/* Ícone e texto */}
              <div className="flex items-center space-x-3 w-full">
                <item.icon className="w-6 h-6 text-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'} font-semibold text-white leading-tight`}>
                    {item.title}
                  </p>
                </div>
                <div className="w-4 h-4 text-white opacity-70 flex-shrink-0">
                  →
                </div>
              </div>
            </div>)}
        </div>
      </div>
      
      <LibrarySelectionDialog 
        open={libraryDialogOpen} 
        onOpenChange={setLibraryDialogOpen} 
      />
    </>
  );
});

QuickAccessSection.displayName = 'QuickAccessSection';

export { QuickAccessSection };