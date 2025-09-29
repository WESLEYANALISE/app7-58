import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from './DesktopFunctionLayout';

interface DesktopBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const DesktopBreadcrumb = ({ items, className }: DesktopBreadcrumbProps) => {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => {
          // Navigate to home/root
        }}
      >
        <Home className="h-3 w-3" />
      </Button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 font-normal",
              index === items.length - 1 
                ? "text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={item.onClick}
            disabled={!item.onClick && !item.href}
          >
            {item.label}
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
};