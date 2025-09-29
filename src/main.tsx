import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importar sistemas de otimização
import './utils/instantLoader'
import './utils/dataPreloader'

// Preload crítico de recursos
const preloadCriticalResources = () => {
  // Preload fontes críticas
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = '/fonts/inter-var.woff2';
  document.head.appendChild(fontLink);

  // Preload imagens críticas
  const criticalImages = [
    '/src/assets/logo-direito.png',
    '/src/assets/categoria-justica.png'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Executar preload
preloadCriticalResources();

// Renderizar com performance otimizada
const root = createRoot(document.getElementById("root")!);

// Usar concurrent features para melhor performance
root.render(<App />);
