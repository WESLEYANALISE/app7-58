import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FunctionSidebarConfig, SidebarItem } from './DesktopFunctionLayout';

interface FunctionSidebarProps {
  config: FunctionSidebarConfig;
  className?: string;
}

export const FunctionSidebar = ({ config, className }: FunctionSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(config.sections.map(section => section.title)) // Iniciar com todas as seções expandidas
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const Icon = item.icon;

    return (
      <div key={item.id} className="w-full">
        <Button
          variant={item.isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-9 px-3",
            level > 0 && "ml-4 w-[calc(100%-1rem)]",
            item.isActive && "bg-primary/10 text-primary font-medium border-r-2 border-primary"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleItem(item.id);
            } else if (item.onClick) {
              item.onClick();
            }
          }}
        >
          {Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0" />}
          <span className="flex-1 text-left truncate text-sm">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-2 h-5 text-xs">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            isExpanded ? 
              <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" /> :
              <ChevronRight className="h-3 w-3 ml-1 flex-shrink-0" />
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("w-64 border-r border-border bg-background/80 backdrop-blur-sm", className)}>
      <div className="p-4 border-b border-border/30">
        <h2 className="font-semibold text-base text-foreground truncate">
          {config.title}
        </h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-3 space-y-2">
          {config.sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-between h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSection(section.title)}
              >
                <span>{section.title}</span>
                {expandedSections.has(section.title) ? 
                  <ChevronDown className="h-3 w-3" /> :
                  <ChevronRight className="h-3 w-3" />
                }
              </Button>
              
              {expandedSections.has(section.title) && (
                <div className="space-y-1 pl-2">
                  {section.items.map(item => renderSidebarItem(item))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};