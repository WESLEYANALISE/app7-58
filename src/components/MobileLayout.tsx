import { ReactNode, useState } from 'react';
import { FooterMenu } from '@/components/FooterMenu';
import { MobileHeader } from '@/components/MobileHeader';
import { GlobalProfessoraButton } from '@/components/GlobalProfessoraButton';
interface MobileLayoutProps {
  children: ReactNode;
}
export const MobileLayout = ({
  children
}: MobileLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Mobile Header - responsivo */}
      <MobileHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content with proper spacing for fixed elements */}
      <main className="flex-1 pt-14 sm:pt-16 pb-20 sm:pb-24 overflow-x-hidden">
        <div className="w-full max-w-full my-0 mx-0 px-px py-[6px]">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation - responsivo */}
      <FooterMenu isVisible={!sidebarOpen} />
      
      {/* Botão Global da Professora IA */}
      <GlobalProfessoraButton />
    </div>;
};