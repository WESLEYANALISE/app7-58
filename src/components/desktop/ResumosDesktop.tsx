import React, { useState } from 'react';
import { DesktopFunctionLayout } from './DesktopFunctionLayout';
import { resumosConfig } from './function-configs/resumos-config';
import { ResumosJuridicos } from '@/components/ResumosJuridicos';
import { useNavigation } from '@/context/NavigationContext';
import type { BreadcrumbItem } from './DesktopFunctionLayout';

export const ResumosDesktop = () => {
  const { setCurrentFunction } = useNavigation();
  const [currentView, setCurrentView] = useState<'areas' | 'temas' | 'visualizacao'>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedTema, setSelectedTema] = useState<string | null>(null);

  const handleBack = () => {
    if (currentView === 'visualizacao') {
      setCurrentView('temas');
      setSelectedTema(null);
    } else if (currentView === 'temas') {
      setCurrentView('areas');
      setSelectedArea(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Resumos Jurídicos', onClick: () => setCurrentView('areas') }
    ];

    if (selectedArea) {
      items.push({ 
        label: selectedArea, 
        onClick: () => setCurrentView('temas') 
      });
    }

    if (selectedTema) {
      items.push({ label: selectedTema });
    }

    return items;
  };

  const getSidebarConfig = () => {
    const config = { ...resumosConfig };
    
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
      functionName="Resumos Jurídicos"
      sidebarConfig={getSidebarConfig()}
      onBack={handleBack}
      breadcrumbItems={getBreadcrumbItems()}
    >
      <div className="h-full">
        <ResumosJuridicos />
      </div>
    </DesktopFunctionLayout>
  );
};