import React, { useState } from 'react';
import { DesktopFunctionLayout } from './DesktopFunctionLayout';
import { flashcardsConfig } from './function-configs/flashcards-config';
import Flashcards from '@/components/Flashcards';
import { useNavigation } from '@/context/NavigationContext';
import type { BreadcrumbItem } from './DesktopFunctionLayout';

export const FlashcardsDesktop = () => {
  const { setCurrentFunction } = useNavigation();
  const [currentView, setCurrentView] = useState<'dashboard' | 'area' | 'estudo'>('dashboard');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const handleBack = () => {
    if (currentView === 'estudo') {
      setCurrentView('area');
    } else if (currentView === 'area') {
      setCurrentView('dashboard');
      setSelectedArea(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Flashcards', onClick: () => setCurrentView('dashboard') }
    ];

    if (selectedArea) {
      items.push({ 
        label: selectedArea, 
        onClick: () => setCurrentView('area') 
      });
    }

    if (currentView === 'estudo') {
      items.push({ label: 'Sessão de Estudo' });
    }

    return items;
  };

  const getSidebarConfig = () => {
    const config = { ...flashcardsConfig };
    
    config.sections.forEach(section => {
      section.items.forEach(item => {
        item.isActive = false;
        if (currentView === 'dashboard' && item.id === 'estatisticas') {
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
      functionName="Flashcards Jurídicos"
      sidebarConfig={getSidebarConfig()}
      onBack={handleBack}
      breadcrumbItems={getBreadcrumbItems()}
    >
      <div className="h-full">
        <Flashcards />
      </div>
    </DesktopFunctionLayout>
  );
};