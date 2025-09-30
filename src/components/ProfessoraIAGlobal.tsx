import React, { useState, useEffect } from 'react';
import { ProfessoraIAEnhanced } from './ProfessoraIAEnhanced';

export const ProfessoraIAGlobal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookContext, setBookContext] = useState<any>(null);
  const [area, setArea] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const { livro, area: evtArea } = (event as any).detail || {};
      if (livro) setBookContext(livro);
      if (evtArea) setArea(String(evtArea));
      setIsOpen(true);
    };

    window.addEventListener('openProfessoraChat', handleOpenChat as EventListener);

    return () => {
      window.removeEventListener('openProfessoraChat', handleOpenChat as EventListener);
    };
  }, []);

  return (
    <ProfessoraIAEnhanced
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setBookContext(null);
      }}
      bookContext={bookContext}
      area={area}
    />
  );
};