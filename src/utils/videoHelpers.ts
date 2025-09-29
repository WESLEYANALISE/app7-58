export const getVideoTitle = (video: { link: string }) => {
  // Extract video title from YouTube URL or use a generic title
  try {
    const url = new URL(video.link);
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      // Try to extract video ID and use it as a fallback
      const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
      return `Vídeo ${videoId}`;
    }
    return 'Vídeo';
  } catch {
    return 'Vídeo';
  }
};

// Função para normalizar URLs de vídeo (especialmente Dropbox)
export const normalizeVideoUrl = (url: string): string => {
  if (!url) return '';
  
// Converter links do Dropbox para formato de reprodução direta
  if (url.includes('dropbox.com')) {
    try {
      // Para URLs do formato scl (shared content links)
      if (url.includes('/scl/fi/')) {
        // Limpar completamente os parâmetros conflitantes
        let cleanUrl = url.split('?')[0]; // Remove todos os parâmetros
        const originalParams = new URLSearchParams(url.split('?')[1] || '');
        
        // Manter apenas parâmetros essenciais
        const allowedParams = ['rlkey', 'st'];
        const newParams = new URLSearchParams();
        
        allowedParams.forEach(param => {
          if (originalParams.has(param)) {
            newParams.set(param, originalParams.get(param)!);
          }
        });
        
        // Adicionar raw=1 para streaming direto
        newParams.set('raw', '1');
        
        const finalUrl = `${cleanUrl}?${newParams.toString()}`;
        console.log('🎥 Dropbox URL normalized:', finalUrl);
        return finalUrl;
      }
      
      // Para URLs antigas do Dropbox
      const urlObj = new URL(url);
      
      // Limpar parâmetros conflitantes
      urlObj.searchParams.delete('dl');
      urlObj.searchParams.delete('raw');
      
      // Adicionar raw=1 para streaming direto
      urlObj.searchParams.set('raw', '1');
      
      const finalUrl = urlObj.toString();
      console.log('🎥 Legacy Dropbox URL normalized:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.warn('⚠️ Error normalizing Dropbox URL:', error);
      // Fallback mais robusto
      let normalizedUrl = url;
      
      // Remover completamente dl= parameters
      normalizedUrl = normalizedUrl.replace(/[?&]dl=[01]/g, '');
      
      // Remover raw=1 existente para evitar duplicação
      normalizedUrl = normalizedUrl.replace(/[?&]raw=1/g, '');
      
      // Adicionar raw=1 no final
      const separator = normalizedUrl.includes('?') ? '&' : '?';
      normalizedUrl = `${normalizedUrl}${separator}raw=1`;
      
      console.log('🔧 Fallback normalized URL:', normalizedUrl);
      return normalizedUrl;
    }
  }
  
  // Para outras URLs, retornar como está
  return url;
};

export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
    const pathname = urlObj.pathname.toLowerCase();
    
    // Check for direct video file extensions
    const hasVideoExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    // Check for common video hosting patterns including Dropbox
    const isVideoHost = urlObj.hostname.includes('youtube.com') || 
                       urlObj.hostname.includes('youtu.be') ||
                       urlObj.hostname.includes('vimeo.com') ||
                       urlObj.hostname.includes('dropbox.com') ||
                       urlObj.hostname.includes('video') ||
                       hasVideoExtension;
    
    return isVideoHost;
  } catch {
    return false;
  }
};

export const getVideoType = (url: string): 'direct' | 'youtube' | 'vimeo' | 'dropbox' | 'unknown' => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (urlObj.hostname.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    if (urlObj.hostname.includes('dropbox.com')) {
      return 'dropbox';
    }
    
    const validExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasVideoExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    if (hasVideoExtension) {
      return 'direct';
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
};