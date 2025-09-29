import React, { useState } from 'react';
import { DesktopFunctionLayout } from './DesktopFunctionLayout';
import { mapasMentaisConfig } from './function-configs/mapas-mentais-config';
import { MapasMentais } from '@/components/MapasMentais';
import { useNavigation } from '@/context/NavigationContext';
import type { BreadcrumbItem } from './DesktopFunctionLayout';

export const MapasMentaisDesktop = () => {
  const { setCurrentFunction } = useNavigation();
  const [currentView, setCurrentView] = useState<'dashboard' | 'area' | 'visualizador'>('dashboard');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedMapa, setSelectedMapa] = useState<string | null>(null);

  const handleBack = () => {
    if (currentView === 'visualizador') {
      setCurrentView('area');
      setSelectedMapa(null);
    } else if (currentView === 'area') {
      setCurrentView('dashboard');
      setSelectedArea(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Mapas Mentais', onClick: () => setCurrentView('dashboard') }
    ];

    if (selectedArea) {
      items.push({ 
        label: selectedArea, 
        onClick: () => setCurrentView('area') 
      });
    }

    if (selectedMapa) {
      items.push({ label: selectedMapa });
    }

    return items;
  };

  const getSidebarConfig = () => {
    const config = { ...mapasMentaisConfig };
    
    config.sections.forEach(section => {
      section.items.forEach(item => {
        item.isActive = false;
        if (currentView === 'dashboard' && item.id === 'todos-mapas') {
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
      functionName="Mapas Mentais Jurídicos"
      sidebarConfig={getSidebarConfig()}
      onBack={handleBack}
      breadcrumbItems={getBreadcrumbItems()}
    >
      <div className="h-full">
        <MapasMentais />
      </div>
    </DesktopFunctionLayout>
  );
};