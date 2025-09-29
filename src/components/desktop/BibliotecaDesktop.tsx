import React, { useState } from 'react';
import { DesktopFunctionLayout } from './DesktopFunctionLayout';
import { bibliotecaConfig } from './function-configs/biblioteca-config';
import { BibliotecaEstudos } from '@/components/BibliotecaEstudos';
import { useNavigation } from '@/context/NavigationContext';
import type { BreadcrumbItem } from './DesktopFunctionLayout';

export const BibliotecaDesktop = () => {
  const { setCurrentFunction } = useNavigation();
  const [currentView, setCurrentView] = useState<'areas' | 'lista' | 'leitor'>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const handleBack = () => {
    if (currentView === 'leitor') {
      setCurrentView('lista');
      setSelectedBook(null);
    } else if (currentView === 'lista') {
      setCurrentView('areas');
      setSelectedArea(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Biblioteca', onClick: () => setCurrentView('areas') }
    ];

    if (selectedArea) {
      items.push({ 
        label: selectedArea, 
        onClick: () => setCurrentView('lista') 
      });
    }

    if (selectedBook) {
      items.push({ label: selectedBook });
    }

    return items;
  };

  const getSidebarConfig = () => {
    const config = { ...bibliotecaConfig };
    
    config.sections.forEach(section => {
      section.items.forEach(item => {
        item.isActive = false;
        if (currentView === 'areas' && item.id === 'todas-areas') {
          item.isActive = true;
        } else if (selectedArea && item.id === selectedArea) {
          item.isActive = true;
        }
      });
    });

    return config;
  };

  return (
    <DesktopFunctionLayout
      functionName="Biblioteca de Estudos"
      sidebarConfig={getSidebarConfig()}
      onBack={handleBack}
      breadcrumbItems={getBreadcrumbItems()}
    >
      <div className="h-full">
        <BibliotecaEstudos />
      </div>
    </DesktopFunctionLayout>
  );
};