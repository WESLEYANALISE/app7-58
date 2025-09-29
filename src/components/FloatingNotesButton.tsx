import { NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';

interface FloatingNotesButtonProps {
  show?: boolean;
}

export const FloatingNotesButton = ({ show = false }: FloatingNotesButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { setCurrentFunction } = useNavigation();

  const handleClick = () => {
    setCurrentFunction('Minhas Anotações');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white/20"
        size="lg"
      >
        <NotebookPen 
          className={`h-8 w-8 text-white transition-transform duration-300 ${
            isHovered ? 'scale-110' : ''
          }`} 
        />
      </Button>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-20 left-0 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
          Minhas Anotações
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
        </div>
      )}
    </div>
  );
};