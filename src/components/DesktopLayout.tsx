
import { ReactNode, useState } from 'react';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { FooterMenu } from '@/components/FooterMenu';
import { useNavigation } from '@/context/NavigationContext';
import { GlobalProfessoraButton } from '@/components/GlobalProfessoraButton';


interface DesktopLayoutProps {
  children: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentFunction } = useNavigation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - sempre visível */}
      <DesktopSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'} flex flex-col min-w-0`}>
        {/* Desktop Header - sempre visível */}
        <DesktopHeader />
        
        {/* Main Content */}
        <main className={`flex-1 overflow-hidden`}>
          <div className={`h-full ${!currentFunction ? 'max-w-7xl mx-auto px-6 py-8' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Botão Global da Professora IA - sempre visível */}
      <GlobalProfessoraButton />
    </div>
  );
};
