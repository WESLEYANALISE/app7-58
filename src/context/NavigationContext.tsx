
import React, { createContext, useContext, useState, memo, useCallback, useMemo } from 'react';

interface NavigationContextType {
  currentFunction: string | null;
  setCurrentFunction: (func: string | null) => void;
  isInFunction: boolean;
  isExplorarOpen: boolean;
  setIsExplorarOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const [currentFunction, setCurrentFunction] = useState<string | null>(null);
  const [isExplorarOpen, setIsExplorarOpen] = useState(false);

  const handleSetCurrentFunction = useCallback((func: string | null) => {
    console.log('NavigationContext - Definindo função:', func);
    if (func === 'Explorar') {
      setIsExplorarOpen(true);
      setCurrentFunction(null);
    } else {
      setIsExplorarOpen(false);
      setCurrentFunction(func);
    }
  }, []);

  const handleSetIsExplorarOpen = useCallback((open: boolean) => {
    setIsExplorarOpen(open);
    if (!open) {
      setCurrentFunction(null);
    }
  }, []);

  const value = useMemo(() => ({
    currentFunction,
    setCurrentFunction: handleSetCurrentFunction,
    isInFunction: currentFunction !== null,
    isExplorarOpen,
    setIsExplorarOpen: handleSetIsExplorarOpen,
  }), [currentFunction, handleSetCurrentFunction, isExplorarOpen, handleSetIsExplorarOpen]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
});

NavigationProvider.displayName = 'NavigationProvider';

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
