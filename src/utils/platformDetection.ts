
export const detectPlatform = (): 'ios' | 'android' | 'other' => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detectar iOS
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  // Detectar Android
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  // Detectar se está em um PWA/WebView
  if (window.matchMedia('(display-mode: standalone)').matches) {
    // Se está em standalone mode, tentar detectar pela orientação e touch
    if (/iphone|ipad|ipod/.test(userAgent) || 
        (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform))) {
      return 'ios';
    }
    if (/android/.test(userAgent)) {
      return 'android';
    }
  }
  
  return 'other';
};

export const getStoreUrl = (platform: 'ios' | 'android' | 'other'): string => {
  switch (platform) {
    case 'android':
      return 'https://play.google.com/store/apps/details?id=br.com.app.gpu2675756.gpu0e7509bfb7bde52aef412888bb17a456';
    case 'ios':
      return 'https://apps.apple.com/us/app/direito-conte%C3%BAdo-jur%C3%ADdico/id6450845861';
    default:
      return 'https://play.google.com/store/apps/details?id=br.com.app.gpu2675756.gpu0e7509bfb7bde52aef412888bb17a456';
  }
};

export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('Não foi possível obter IP, usando fallback');
    return 'unknown';
  }
};
