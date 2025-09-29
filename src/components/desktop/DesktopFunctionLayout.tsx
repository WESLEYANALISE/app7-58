import React, { ReactNode } from 'react';
import { FunctionSidebar } from './FunctionSidebar';
import { FunctionHeader } from './FunctionHeader';
import { DesktopBreadcrumb } from './DesktopBreadcrumb';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface DesktopFunctionLayoutProps {
  children: ReactNode;
  functionName: string;
  sidebarConfig: FunctionSidebarConfig;
  onBack?: () => void;
  breadcrumbItems?: BreadcrumbItem[];
  headerActions?: ReactNode;
}

export interface FunctionSidebarConfig {
  title: string;
  sections: SidebarSection[];
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isActive?: boolean;
  onClick?: () => void;
  children?: SidebarItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export const DesktopFunctionLayout = ({
  children,
  functionName,
  sidebarConfig,
  onBack,
  breadcrumbItems = [],
  headerActions
}: DesktopFunctionLayoutProps) => {
  const { isDesktop } = useDeviceDetection();

  // Se não for desktop, retorna apenas o conteúdo (mobile/tablet usam layouts próprios)
  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar da Função - à direita do sidebar principal */}
      <FunctionSidebar config={sidebarConfig} className="border-r-0" />
      
      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header da Função */}
        <FunctionHeader
          title={functionName}
          onBack={onBack}
          actions={headerActions}
        />
        
        {/* Breadcrumb */}
        {breadcrumbItems.length > 0 && (
          <div className="px-6 py-3 border-b border-border/30">
            <DesktopBreadcrumb items={breadcrumbItems} />
          </div>
        )}
        
        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-background/30">
            <div className="max-w-4xl mx-auto px-4 py-4">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Botão Global da Professora IA - removido daqui pois já está no layout principal */}
    </div>
  );
};