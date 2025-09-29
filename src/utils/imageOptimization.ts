// Otimizações para imagens
export const optimizeImageSrc = (src: string, width?: number, height?: number): string => {
  if (!src) return '/placeholder.svg';
  
  // Se for uma URL externa, retorna como está
  if (src.startsWith('http')) {
    return src;
  }
  
  // Se for uma imagem local, adiciona parâmetros de otimização se suportado
  return src;
};

export const getOptimizedImageProps = (src: string, alt: string, width?: number, height?: number) => ({
  src: optimizeImageSrc(src, width, height),
  alt,
  loading: 'lazy' as const,
  decoding: 'async' as const,
  onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder.svg';
  },
  style: {
    aspectRatio: width && height ? `${width}/${height}` : undefined
  }
});

// Hook para intersection observer de imagens
export const useImageLazyLoading = () => {
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.1,
    }
  );

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    disconnect: () => imageObserver.disconnect(),
  };
};