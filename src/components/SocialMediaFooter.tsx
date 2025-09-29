import { GraduationCap, PenTool } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
export const SocialMediaFooter = () => {
  const {
    setCurrentFunction
  } = useNavigation();
  const handlePlanoEstudo = () => {
    setCurrentFunction('Plano de Estudo');
  };
  const handleRedacao = () => {
    setCurrentFunction('Redação');
  };
  return (
    <div className="hidden">
      {/* This component is temporarily hidden but functional */}
    </div>
  );
};