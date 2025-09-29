import React, { useState } from 'react';
import { DesktopFunctionLayout } from './DesktopFunctionLayout';
import { vademecumConfig } from './function-configs/vademecum-config';
import VadeMecumUltraFast from '@/components/VadeMecumUltraFast';
import { useNavigation } from '@/context/NavigationContext';
import type { BreadcrumbItem } from './DesktopFunctionLayout';

export const VadeMecumDesktop = () => {
  const { setCurrentFunction } = useNavigation();
  const [currentView, setCurrentView] = useState<'home' | 'codes' | 'articles'>('home');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const handleBack = () => {
    if (currentView === 'articles') {
      setCurrentView('codes');
      setSelectedArticle(null);
    } else if (currentView === 'codes') {
      setCurrentView('home');
      setSelectedCode(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Vade Mecum', onClick: () => setCurrentView('home') }
    ];

    if (selectedCode) {
      items.push({ 
        label: selectedCode, 
        onClick: () => setCurrentView('codes') 
      });
    }

    if (selectedArticle) {
      items.push({ label: `Artigo ${selectedArticle}` });
    }

    return items;
  };

  const getSidebarConfig = () => {
    const config = { ...vademecumConfig };
    
    config.sections.forEach(section => {
      section.items.forEach(item => {
        item.isActive = false;
        if (currentView === 'home' && item.id === 'home') {
          item.isActive = true;
        } else if (selectedCode && item.id === selectedCode) {
          item.isActive = true;
        }
      });
    });

    return config;
  };

  return (
    <DesktopFunctionLayout
      functionName="Vade Mecum Digital"
      sidebarConfig={getSidebarConfig()}
      onBack={handleBack}
      breadcrumbItems={getBreadcrumbItems()}
    >
      <div className="h-full">
        <VadeMecumUltraFast />
      </div>
    </DesktopFunctionLayout>
  );
};