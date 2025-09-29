import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { GlobalSearch } from '@/components/GlobalSearch';
export const SearchButton = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setIsSearchOpen(true)}
        className="h-16 w-16 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 rounded-full text-white transition-all duration-300 flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 gap-1"
        variant="ghost"
      >
        <Search className="w-6 h-6" />
        <span className="text-xs font-semibold">Buscar</span>
      </Button>

      {isSearchOpen && (
        <Suspense fallback={null}>
          <GlobalSearch onClose={() => setIsSearchOpen(false)} />
        </Suspense>
      )}
    </>
  );
};