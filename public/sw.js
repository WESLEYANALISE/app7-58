// Service Worker para cache agressivo e carregamento instantâneo
const CACHE_NAME = 'legal-app-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Recursos críticos para cache imediato
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/assets/logo-direito.png',
  '/src/assets/categoria-justica.png'
];

// Recursos para preload
const PRELOAD_RESOURCES = [
  '/src/components/MobileLayout.tsx',
  '/src/components/DesktopLayout.tsx',
  '/src/components/CategoryAccessSection.tsx',
  '/src/components/SocialMediaFooter.tsx'
];

// Install - Cache recursos críticos
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Preload recursos importantes
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.addAll(PRELOAD_RESOURCES);
      })
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate - Limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch - Estratégia cache-first para recursos estáticos
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Cache first para recursos estáticos
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.url.includes('.tsx') ||
      request.url.includes('.ts') ||
      request.url.includes('.css')) {
    
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          // Retorna do cache e atualiza em background
          fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, fetchResponse.clone());
              });
            }
          }).catch(() => {});
          
          return response;
        }
        
        // Se não está no cache, busca da rede
        return fetch(request).then(fetchResponse => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return fetchResponse;
        });
      }).catch(() => {
        // Fallback para requests que falharam
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
    );
  }
  
  // Network first para APIs (Supabase)
  else if (request.url.includes('supabase') || request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  }
});

// Background sync para preload de componentes
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PRELOAD_COMPONENTS') {
    const components = event.data.components || [];
    
    caches.open(DYNAMIC_CACHE).then(cache => {
      components.forEach(component => {
        fetch(component).then(response => {
          if (response.ok) {
            cache.put(component, response);
          }
        }).catch(() => {});
      });
    });
  }
});