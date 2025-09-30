import { useNavigation } from '@/context/NavigationContext';
import { CursosPreparatoriosUltraModern } from './courses/CursosPreparatoriosUltraModern';

export const CursosPreparatorios = () => {
  const { setCurrentFunction } = useNavigation();

  const handleBack = () => {
    setCurrentFunction(null);
  };
  
  return <CursosPreparatoriosUltraModern onBack={handleBack} />;
};