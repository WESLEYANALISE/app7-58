import { Suspense, memo, useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { MobileLayout } from '@/components/MobileLayout';
import { DesktopLayout } from '@/components/DesktopLayout';
import { TabletLayout } from '@/components/TabletLayout';
import { IntroOnboarding } from '@/components/IntroOnboarding';
import { NewsUpdateNotification } from '@/components/NewsUpdateNotification';
import { useNavigation } from '@/context/NavigationContext';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useAuth } from '@/context/AuthContext';
import { 
  LazyFeaturesGrid, 
  LazySuporteTab, 
  LazyProductCarousel,
  preloadCriticalComponents
} from '@/components/lazy/LazyComponents';
import { FloatingNotesButton } from '@/components/FloatingNotesButton';
import { CategoryAccessSection } from '@/components/CategoryAccessSection';
import { SocialMediaFooter } from '@/components/SocialMediaFooter';
import { AppFunction } from '@/components/AppFunctionOptimized';
import { optimizeAppLoading } from '@/utils/bundleOptimization';
import { ExplorarCarousel } from '@/components/ExplorarCarousel';

// Loading fallback component
const LoadingComponent = memo(() => <div className="w-full h-32 flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>);
LoadingComponent.displayName = 'LoadingComponent';

const Index = memo(() => {
  const {
    isInFunction,
    isExplorarOpen
  } = useNavigation();
  const {
    isMobile,
    isTablet,
    isDesktop
  } = useDeviceDetection();
  const { user, loading } = useAuth();

  const [showIntro, setShowIntro] = useState(false);

  // Check if intro should be shown - only for non-authenticated users
  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    // If user is authenticated, never show intro
    if (user) {
      setShowIntro(false);
      return;
    }
    
    // If user is not authenticated, check if intro was already seen
    const introSeen = localStorage.getItem('intro_seen_v1');
    if (!introSeen) {
      setShowIntro(true);
    }
  }, [user, loading]);

  // Preload componentes críticos na inicialização
  useEffect(() => {
    preloadCriticalComponents();
    optimizeAppLoading();
  }, []);

  // Handle intro completion
  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Show intro onboarding if first visit and user is not authenticated
  if (showIntro && !user && !loading) {
    return <IntroOnboarding onComplete={handleIntroComplete} />;
  }

  // Show loading silently while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If we're in a function, show the function component directly (no loading)
  if (isInFunction) {
    return <AppFunction />;
  }

  // Main content for both mobile and desktop with instant loading
  const mainContent = <>
      {/* Category Access Section - Direct loading */}
      <CategoryAccessSection />

      {/* Social Media Footer - Direct loading */}
      <SocialMediaFooter />
    </>;

  // Return appropriate layout based on device
  const layoutContent = (
    <div className="relative overflow-hidden min-h-screen">
      {/* Main Content with slide transition */}
      <div className={`
        transition-transform duration-500 ease-in-out
        ${isExplorarOpen ? '-translate-x-full opacity-20' : 'translate-x-0 opacity-100'}
      `}>
        {isMobile ? (
          <MobileLayout>{mainContent}</MobileLayout>
        ) : isTablet ? (
          <TabletLayout>{mainContent}</TabletLayout>
        ) : (
          <DesktopLayout>{mainContent}</DesktopLayout>
        )}
        
        {/* Notificação de atualizações de notícias */}
        <NewsUpdateNotification />
        
        {/* Toast notifications */}
        <Toaster />
      </div>
      
      {/* Explorar Carousel Overlay */}
      {isExplorarOpen && <ExplorarCarousel />}
    </div>
  );

  return layoutContent;
});
Index.displayName = 'Index';
export default Index;