
import { Scale, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { MobileSidebar } from './MobileSidebar';
import { NewsNotificationDropdownEnhanced } from './NewsNotificationDropdownEnhanced';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { useAuth } from '@/context/AuthContext';
interface MobileHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
export const MobileHeader = ({
  sidebarOpen,
  setSidebarOpen
}: MobileHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount, resetNotifications } = useSmartNotifications();
  const { profile } = useAuth();

  const handleBellClick = () => {
    if (!notificationsOpen) {
      // Se está abrindo as notificações, resetar contador
      resetNotifications();
    }
    setNotificationsOpen(!notificationsOpen);
  };
  return <>
      <header data-mobile-header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/20 safe-area-pt animate-slide-up">
        <div className="px-4 py-3 bg-zinc-950 relative overflow-hidden">
          {/* Background animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent-legal/5 to-primary/10 opacity-50 animate-shimmer" />
          
          <div className="flex items-center justify-between relative z-10">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden 
                            transform transition-all duration-500 hover:scale-110 hover:rotate-6 
                            bg-gradient-to-br from-primary/20 to-accent-legal/20 backdrop-blur-sm
                            animate-float-enhanced">
                <img src="https://imgur.com/zlvHIAs.png" alt="Direito Premium" className="w-full h-full object-contain" />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h1 className="text-lg font-bold gradient-text-legal animate-shimmer">
                  {profile?.nome_completo || 'Usuário'}
                </h1>
                <p className="text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
                  "Justiça é a virtude completa"
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 animate-slide-in-right">
              {/* Enhanced Notification Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full hover:bg-primary/20 bg-primary/10 
                         transition-all duration-500 active:scale-90 relative group overflow-hidden
                         transform hover:scale-110 hover:rotate-12"
                onClick={handleBellClick}
              >
                {/* Multi-layered glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent-legal/30 to-primary/30 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-morphing-bg" />
                
                <Bell className={cn(
                  "h-5 w-5 text-primary transition-all duration-500 relative z-10 transform",
                  "group-hover:drop-shadow-2xl group-hover:animate-wiggle",
                  unreadCount > 0 && "animate-bounce-soft text-amber-400"
                )} />
                
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-6 w-auto min-w-[24px] px-1 rounded-full 
                                 bg-gradient-to-br from-red-500 via-red-600 to-red-700 
                                 flex items-center justify-center text-white text-xs font-bold 
                                 shadow-2xl border-2 border-background animate-notification-glow
                                 transform hover:scale-110 transition-transform duration-200">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full bg-primary/30 scale-0 
                               group-active:scale-150 opacity-0 group-active:opacity-50 
                               transition-all duration-200" />
              </Button>

              {/* Enhanced Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full hover:bg-amber-400/20 bg-amber-400/10 
                         transition-all duration-500 active:scale-90 relative group overflow-hidden
                         transform hover:scale-110" 
                onClick={() => setSidebarOpen(true)}
              >
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-400/20 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <Menu className={`h-5 w-5 text-amber-400 transition-all duration-500 relative z-10 
                                transform group-hover:drop-shadow-lg group-hover:animate-wiggle
                                ${sidebarOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`} />
                
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full bg-amber-400/40 scale-0 
                               group-active:scale-150 opacity-0 group-active:opacity-50 
                               transition-all duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NewsNotificationDropdownEnhanced 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </>;
};
