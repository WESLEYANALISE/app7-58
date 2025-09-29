import React, { useState } from 'react';
import { DesktopFunctionLayout } from './DesktopFunctionLayout';
import { videoaulasConfig } from './function-configs/videoaulas-config';
import { Videoaulas } from '@/components/Videoaulas';
import { useNavigation } from '@/context/NavigationContext';
import type { BreadcrumbItem } from './DesktopFunctionLayout';

export const VideoaulasDesktop = () => {
  const { setCurrentFunction } = useNavigation();
  const [currentView, setCurrentView] = useState<'areas' | 'playlist' | 'video'>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const handleBack = () => {
    if (currentView === 'video') {
      setCurrentView('playlist');
      setSelectedPlaylist(null);
    } else if (currentView === 'playlist') {
      setCurrentView('areas');
      setSelectedArea(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Videoaulas', onClick: () => setCurrentView('areas') }
    ];

    if (selectedArea) {
      items.push({ 
        label: selectedArea, 
        onClick: () => setCurrentView('playlist') 
      });
    }

    if (selectedPlaylist) {
      items.push({ label: selectedPlaylist });
    }

    return items;
  };

  // Atualizar configuração do sidebar baseado no contexto atual
  const getSidebarConfig = () => {
    const config = { ...videoaulasConfig };
    
    // Marcar item ativo baseado na navegação atual
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
      functionName="Videoaulas Jurídicas"
      sidebarConfig={getSidebarConfig()}
      onBack={handleBack}
      breadcrumbItems={getBreadcrumbItems()}
    >
      <div className="h-full">
        <Videoaulas />
      </div>
    </DesktopFunctionLayout>
  );
};