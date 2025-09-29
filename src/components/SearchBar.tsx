import { useState, Suspense } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useTypewriter } from '@/hooks/useTypewriter';

export const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isMobile, isTablet } = useDeviceDetection();

  // Animação de máquina de escrever para o placeholder
  const typewriterTexts = [
    'Busque por conteúdos, leis, artigos...',
    'Encontre jurisprudências...',
    'Procure no Vade Mecum...',
    'Busque videoaulas...',
    'Pesquise no JusBlog...'
  ];
  
  const animatedPlaceholder = useTypewriter({ 
    texts: typewriterTexts, 
    speed: 120, 
    delay: 2500 
  });

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setIsSearchOpen(true);
    }
  };

  return (
    <>
      <div className={`${isMobile ? 'px-4' : isTablet ? 'px-8' : 'px-12'} w-full max-w-2xl mx-auto`}>
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/40 to-yellow-500/40 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-75"></div>
          
          {/* Main search bar */}
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/60 overflow-hidden">
            <div className="flex items-center">
              {/* Search icon button */}
              <div 
                className="flex items-center justify-center p-4 bg-gradient-to-br from-yellow-500 via-yellow-400 to-amber-400 text-black cursor-pointer hover:from-yellow-600 hover:via-yellow-500 hover:to-amber-500 transition-all duration-300 shadow-lg"
                onClick={handleSearchClick}
              >
                <Search className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} drop-shadow-sm`} />
              </div>
              
              {/* Input field */}
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={searchTerm ? '' : animatedPlaceholder}
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onClick={handleSearchClick}
                  className={`${isMobile ? 'text-sm' : 'text-base'} border-0 bg-transparent placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none px-4 py-4 cursor-pointer font-medium text-white`}
                />
                {/* Blinking cursor effect when not focused */}
                {!searchTerm && animatedPlaceholder && (
                  <span 
                    className="absolute top-1/2 transform -translate-y-1/2 w-0.5 h-5 bg-yellow-400 animate-pulse"
                    style={{ left: `calc(4rem + ${animatedPlaceholder.length * 0.6}ch)` }}
                  ></span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Helper text */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/90 font-medium tracking-wide`}>
              Encontre rapidamente o que você precisa
            </p>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse animation-delay-300"></div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <GlobalSearch 
            onClose={() => {
              setIsSearchOpen(false);
              setSearchTerm('');
            }} 
          />
        </Suspense>
      )}
    </>
  );
};