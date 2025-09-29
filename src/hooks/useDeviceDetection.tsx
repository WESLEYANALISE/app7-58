
import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      const isTouchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsTouchDevice(isTouchSupported);

      // Mobile detection - breakpoints mais precisos
      if (width < 640) { // sm em Tailwind
        setDeviceType('mobile');
      }
      // Tablet detection
      else if (width >= 640 && width < 1024) { // sm até lg
        setDeviceType('tablet');
      }
      // Desktop detection
      else {
        setDeviceType('desktop');
      }

      // Enhanced detection for specific devices
      if (/iPhone|iPod/.test(userAgent)) {
        setDeviceType('mobile');
      } else if (/iPad/.test(userAgent)) {
        setDeviceType('tablet');
      }
    };

    checkDevice();
    
    // Debounce para performance
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 100);
    };
    
    window.addEventListener('resize', debouncedCheck);
    
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    deviceType,
    isTouchDevice,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet', 
    isDesktop: deviceType === 'desktop',
    isMobileOrTablet: deviceType === 'mobile' || deviceType === 'tablet'
  };
};
