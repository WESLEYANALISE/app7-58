import { useNavigation } from '@/context/NavigationContext';
import { CursosPreparatoriosElegant } from './CursosPreparatoriosElegant';

export const CursosPreparatorios = () => {
  const { setCurrentFunction } = useNavigation();

  const handleBack = () => {
    setCurrentFunction(null);
  };
  
  return <CursosPreparatoriosElegant onBack={handleBack} />;
};