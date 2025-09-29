import { Bell, Settings, User, Newspaper, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigation } from '@/context/NavigationContext';

export const DesktopHeader = () => {
  const { currentFunction, setCurrentFunction } = useNavigation();

  return (
    <>
      <header data-desktop-header className="h-16 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">
              {currentFunction || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  title="Jusblog"
                >
                  <Newspaper className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-background border border-border">
                <DropdownMenuItem 
                  onClick={() => setCurrentFunction('Blog Jurídico')}
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                  <Newspaper className="h-4 w-4 mr-3" />
                  <div className="flex flex-col">
                    <span className="font-medium">Jusblog</span>
                    <span className="text-sm text-muted-foreground">Blog jurídico com artigos e análises</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentFunction('Radar Jurídico')}
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                  <Radar className="h-4 w-4 mr-3" />
                  <div className="flex flex-col">
                    <span className="font-medium">Radar Jurídico</span>
                    <span className="text-sm text-muted-foreground">Acompanhe as últimas notícias jurídicas</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};