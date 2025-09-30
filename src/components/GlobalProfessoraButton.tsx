import { useState, useMemo } from 'react';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { ProfessoraIAEnhanced } from './ProfessoraIAEnhanced';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useNavigation } from '@/context/NavigationContext';
import { useLocation } from 'react-router-dom';

export const GlobalProfessoraButton = () => {
  const [showProfessora, setShowProfessora] = useState(false);
  const { isDesktop } = useDeviceDetection();
  const { currentFunction } = useNavigation();
  const location = useLocation();

  // Detecta automaticamente a área/contexto atual
  const contextData = useMemo(() => {
    const pathname = location.pathname;
    
    if (currentFunction) {
      // Se está em uma função específica, usar essa informação
      const functionNames = {
        'Videoaulas': 'Videoaulas',
        'Biblioteca Jurídica': 'Biblioteca Jurídica', 
        'Vade Mecum': 'Vade Mecum',
        'Flashcards': 'Flashcards',
        'Mapas Mentais': 'Mapas Mentais',
        'Resumos Jurídicos': 'Resumos Jurídicos',
        'Notícias Jurídicas': 'Notícias Jurídicas',
        'Simulados OAB': 'Simulados OAB',
        'Banco de Questões': 'Banco de Questões',
        'Plano de Estudos': 'Plano de Estudos',
        'Lista de Tarefas': 'Lista de Tarefas',
        'Redação Jurídica': 'Redação Jurídica'
      };
      
      const area = functionNames[currentFunction] || currentFunction;
      
      return {
        area,
        contextMessage: `Área atual: ${area}`
      };
    }
    
    // Se não está em função específica, detectar pela URL
    if (pathname.includes('biblioteca')) {
      return {
        area: 'Biblioteca Jurídica',
        contextMessage: 'Área atual: Biblioteca Jurídica'
      };
    }
    if (pathname.includes('vademecum')) {
      return {
        area: 'Vade Mecum',
        contextMessage: 'Área atual: Vade Mecum'
      };
    }
    if (pathname.includes('videoaulas')) {
      return {
        area: 'Videoaulas',
        contextMessage: 'Área atual: Videoaulas'
      };
    }
    
    // Contexto padrão
    return {
      area: 'Direito',
      contextMessage: 'Área atual: Estudos de Direito'
    };
  }, [currentFunction, location.pathname]);

  return (
    <>
      <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      
      <ProfessoraIAEnhanced 
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        area={contextData.area}
      />
    </>
  );
};