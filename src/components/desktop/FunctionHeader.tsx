import React, { ReactNode } from 'react';
import { ArrowLeft, Search, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FunctionHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
  showSearch?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
}

export const FunctionHeader = ({
  title,
  onBack,
  actions,
  showSearch = false,
  onSearch,
  searchPlaceholder = "Pesquisar..."
}: FunctionHeaderProps) => {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        )}
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">
            {title}
          </h1>
          
          {showSearch && (
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10 h-9"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {actions}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};