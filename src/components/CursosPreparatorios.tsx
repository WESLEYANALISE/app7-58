import { useNavigation } from '@/context/NavigationContext';
import { CursosPreparatoriosModern } from './courses/CursosPreparatoriosModern';

export const CursosPreparatorios = () => {
  const { setCurrentFunction } = useNavigation();

  const handleBack = () => {
    setCurrentFunction(null);
  };
  
  return <CursosPreparatoriosModern onBack={handleBack} />;
};