
import { useState } from 'react';
import { BookOpenCheck, Library } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useCapasFuncaoMap } from '@/hooks/useCapasFuncao';

interface LibrarySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LibrarySelectionDialog = ({ open, onOpenChange }: LibrarySelectionDialogProps) => {
  const { setCurrentFunction } = useNavigation();
  const { functions } = useAppFunctions();
  const { isMobile } = useDeviceDetection();
  const { capasMap } = useCapasFuncaoMap();

  const getFunctionName = (searchTerms: string[], targetId?: number) => {
    if (!functions || functions.length === 0) {
      return searchTerms[0];
    }
    
    // Se foi especificado um ID, buscar por ele primeiro
    if (targetId) {
      const idMatch = functions.find(func => func.id === targetId);
      if (idMatch) {
        return idMatch.funcao;
      }
    }
    
    // Correspondência exata
    for (const term of searchTerms) {
      const exactMatch = functions.find(func => 
        func.funcao.toLowerCase() === term.toLowerCase()
      );
      if (exactMatch) {
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
        return partialMatch.funcao;
      }
    }
    
    return searchTerms[0];
  };

  const libraryOptions = [
    {
      id: 1,
      title: 'Biblioteca Jurídica',
      description: 'Acervo completo de materiais jurídicos',
      icon: Library,
      functionName: getFunctionName(['Biblioteca Jurídica']),
      color: 'from-blue-500 to-blue-600',
      coverImage: capasMap['Biblioteca Jurídica'] || ''
    },
    {
      id: 2,
      title: 'Biblioteca de Clássicos',
      description: 'Obras essenciais da literatura jurídica',
      icon: BookOpenCheck,
      functionName: 'Biblioteca Clássicos',
      color: 'from-emerald-500 to-green-600',
      coverImage: capasMap['Biblioteca Clássicos'] || ''
    },
    {
      id: 3,
      title: 'Fora da Toga',
      description: 'Livros além do mundo jurídico para enriquecer sua jornada',
      icon: BookOpenCheck,
      functionName: 'BibliotecaForaDaToga',
      color: 'from-purple-500 to-purple-600',
      coverImage: capasMap['Fora da Toga'] || ''
    }
  ];

  const handleOptionClick = (option: typeof libraryOptions[0]) => {
    setCurrentFunction(option.functionName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-white">
            Escolha uma Biblioteca
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {libraryOptions.map((option) => {
            const Icon = option.icon;
            
            return (
              <div
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className="cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] bg-white/10 hover:bg-white/20 shadow-md hover:shadow-lg group backdrop-blur-sm border border-white/10"
              >
                {/* Imagem de capa de fundo se disponível */}
                {option.coverImage && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundImage: `url(${option.coverImage})` }}
                  />
                )}
                
                <div className="relative p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {option.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {option.description}
                      </p>
                    </div>
                    
                    <div className="text-white/70 group-hover:text-white transition-colors">
                      →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
