import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Interface para dados específicos de navegação
interface NavigationContext {
  itemId?: string;
  itemTitle?: string;
  itemData?: any;
  searchTerm?: string;
  targetSection?: string;
  autoOpen?: boolean;
}

interface DeepNavigationContextType {
  navigationContext: NavigationContext | null;
  setNavigationContext: (context: NavigationContext | null) => void;
  navigateWithContext: (functionName: string, context: NavigationContext) => void;
  clearContext: () => void;
}

const DeepNavigationContext = createContext<DeepNavigationContextType | undefined>(undefined);

export const DeepNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(null);

  const navigateWithContext = useCallback((functionName: string, context: NavigationContext) => {
    // Store context data for the target function to use
    setNavigationContext(context);
    
    // Navigate to function (will be handled by existing navigation system)
    window.dispatchEvent(new CustomEvent('navigateWithContext', { 
      detail: { functionName, context } 
    }));
  }, []);

  const clearContext = useCallback(() => {
    setNavigationContext(null);
  }, []);

  return (
    <DeepNavigationContext.Provider value={{
      navigationContext,
      setNavigationContext,
      navigateWithContext,
      clearContext
    }}>
      {children}
    </DeepNavigationContext.Provider>
  );
};

export const useDeepNavigation = () => {
  const context = useContext(DeepNavigationContext);
  if (!context) {
    throw new Error('useDeepNavigation must be used within DeepNavigationProvider');
  }
  return context;
};