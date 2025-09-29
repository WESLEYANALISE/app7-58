import { X, Home, Scale, Headphones, Library, Bot, User, Settings, HelpCircle, 
         GitBranch, Monitor, Play, Folder, Newspaper, Film, Brain, BookOpen, 
         FileText, Search, GraduationCap, Calendar, Clock, Award, Target,
         Bookmark, Download, Upload, Share, Heart, Star, Zap, Shield,
         Globe, Camera, Music, Video, Image, File, Archive, Code,
         Database, Server, Wifi, Lock, Key, Eye, EyeOff, Trash,
         Edit, Copy, Clipboard, Printer, ScanLine, Phone, Mail,
         MessageCircle, Bell, Flag, Tag, Hash, AtSign, Percent,
         DollarSign, Euro, PoundSterling, CreditCard, ShoppingCart, Package,
         Truck, Map, MapPin, Navigation, Compass, Route, Car,
         Plane, Ship, Train, Bus, Bike, Footprints, Clock3, Timer,
         Watch, AlarmClock, Calendar as CalendarIcon, CalendarDays, Hammer, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { useAuth } from '@/context/AuthContext';
import { useAccessHistory } from '@/hooks/useAccessHistory';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Array expandido de ícones únicos
const availableIcons = [
  Scale, Bot, Library, Headphones, GitBranch, Monitor, Play, Folder, 
  Newspaper, Film, Brain, BookOpen, FileText, Search, GraduationCap, 
  Calendar, Clock, Award, Target, Bookmark, Download, Upload, Share, 
  Heart, Star, Zap, Shield, Globe, Camera, Music, Video, Image, 
  File, Archive, Code, Database, Server, Wifi, Lock, Key, Eye, 
  EyeOff, Trash, Edit, Copy, Clipboard, Printer, ScanLine, Phone, 
  Mail, MessageCircle, Bell, Flag, Tag, Hash, AtSign, Percent, 
  DollarSign, Euro, PoundSterling, CreditCard, ShoppingCart, Package, Truck, 
  Map, MapPin, Navigation, Compass, Route, Car, Plane, Ship, Train, 
  Bus, Bike, Footprints, Clock3, Timer, Watch, AlarmClock, CalendarIcon, CalendarDays, Hammer
];

const getUniqueIconForFunction = (funcao: string, index: number) => {
  const name = funcao.toLowerCase();
  
  // Mapeamento específico para funções principais
  if (name.includes('vade') || name.includes('mecum')) return Scale;
  if (name.includes('assistente') && name.includes('ia')) return Bot;
  if (name.includes('biblioteca') && (name.includes('jurídica') || name.includes('clássicos'))) return BookOpen;
  if (name.includes('biblioteca')) return Library;
  if (name.includes('audio') || name.includes('áudio')) return Headphones;
  if (name.includes('mapa') && name.includes('mental')) return Brain;
  if (name.includes('plataforma') && name.includes('desktop')) return Monitor;
  if (name.includes('flashcard') || name.includes('flash card')) return Zap;
  if (name.includes('resumo') || name.includes('codigo') || name.includes('código')) return BookOpen;
  if (name.includes('video') || name.includes('vídeo') || name.includes('aula')) return Play;
  if (name.includes('petições') || name.includes('peticoes') || name.includes('petição')) return Folder;
  if (name.includes('noticia') || name.includes('notícia') || name.includes('juridica')) return Newspaper;
  if (name.includes('juriflix') || name.includes('filme') || name.includes('cinema')) return Film;
  if (name.includes('simulado') || name.includes('prova') || name.includes('oab')) return Scale;
  if (name.includes('calendario') || name.includes('agenda')) return Calendar;
  if (name.includes('curso') || name.includes('aula')) return GraduationCap;
  if (name.includes('pesquisa') || name.includes('busca')) return Search;
  if (name.includes('documento') || name.includes('texto')) return FileText;
  if (name.includes('download') || name.includes('baixar')) return Download;
  if (name.includes('upload') || name.includes('enviar')) return Upload;
  if (name.includes('compartilhar') || name.includes('share')) return Share;
  if (name.includes('favorito') || name.includes('favoritar')) return Heart;
  if (name.includes('avaliação') || name.includes('rating')) return Star;
  if (name.includes('rápido') || name.includes('express')) return Zap;
  if (name.includes('segurança') || name.includes('security')) return Shield;
  if (name.includes('web') || name.includes('site')) return Globe;
  if (name.includes('imagem') || name.includes('foto')) return Camera;
  if (name.includes('música') || name.includes('music')) return Music;
  if (name.includes('arquivo') || name.includes('file')) return Archive;
  if (name.includes('código') || name.includes('programação')) return Code;
  if (name.includes('banco') || name.includes('dados')) return Database;
  if (name.includes('questões') || name.includes('questao') || name.includes('questão')) return Target; // Alterado para alvo
  if (name.includes('dicionário') || name.includes('dicionario')) return Search; // Alterado para lupa
  if (name.includes('indicações') || name.includes('indicacao') || name.includes('livros')) return Star; // Ícone estrela para indicações
  
  // Se não encontrar correspondência específica, usa um ícone único baseado no índice
  return availableIcons[index % availableIcons.length] || Scale;
};

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const { setCurrentFunction, currentFunction } = useNavigation();
  const { functions } = useAppFunctions();
  const { profile, signOut, updateProfile } = useAuth();
  const { getRecentItems, addToHistory, clearHistory } = useAccessHistory();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newName, setNewName] = useState(profile?.nome_completo || '');
  const [newEmail, setNewEmail] = useState(profile?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Obter últimos acessos
  const recentItems = getRecentItems(5);

  // Registrar acesso sempre que uma função mudar
  useEffect(() => {
    if (currentFunction) {
      const funcaoData = functions.find(f => f.funcao === currentFunction);
      if (funcaoData) {
        const Icon = getUniqueIconForFunction(funcaoData.funcao, functions.indexOf(funcaoData));
        addToHistory({
          id: funcaoData.funcao,
          title: funcaoData.funcao,
          icon: Icon.name || funcaoData.funcao.charAt(0)
        });
      }
    }
  }, [currentFunction, functions, addToHistory]);

  const handleItemClick = (funcao: string | null) => {
    setCurrentFunction(funcao);
    
    // Registrar no histórico se não for início
    if (funcao) {
      const funcaoData = functions.find(f => f.funcao === funcao);
      if (funcaoData) {
        const Icon = getUniqueIconForFunction(funcaoData.funcao, functions.indexOf(funcaoData));
        addToHistory({
          id: funcaoData.funcao,
          title: funcaoData.funcao,
          icon: Icon.name || funcaoData.funcao.charAt(0)
        });
      }
    }
    
    onClose();
  };

  const handleSettingsClick = () => {
    setNewName(profile?.nome_completo || '');
    setNewEmail(profile?.email || '');
    setShowSettingsDialog(true);
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome válido.",
        variant: "destructive"
      });
      return;
    }

    if (!newEmail.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    const { error } = await updateProfile({
      nome_completo: newName.trim(),
      email: newEmail.trim()
    });
    
    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar suas informações. Tente novamente.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setShowSettingsDialog(false);
    }
    setIsUpdating(false);
  };

  return (
    <>
      {/* Backdrop with enhanced animation */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar with enhanced animations */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Enhanced Header with animations */}
        <div className="flex items-center justify-between p-6 border-b border-border/20 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg animate-legal-shimmer overflow-hidden">
              <img 
                src="https://imgur.com/zlvHIAs.png" 
                alt="Direito Premium" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text animate-legal-text-glow">Menu</h2>
              <p className="text-sm text-muted-foreground">Todas as funções</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-300 hover:rotate-90"
          >
            <X className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-90'}`} />
          </Button>
        </div>

        {/* Content with enhanced animations */}
        <div className="flex flex-col h-[calc(100%-88px)]">
          {/* Main Menu with all functions and enhanced animations */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Últimos Acessos */}
              {recentItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground animate-slide-in flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Últimos Acessos
                    </h3>
                    {recentItems.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    {recentItems.map((item, index) => {
                      const funcaoData = functions.find(f => f.funcao === item.title);
                      const Icon = funcaoData ? getUniqueIconForFunction(funcaoData.funcao, functions.indexOf(funcaoData)) : Clock;
                      const timeAgo = new Date(item.timestamp);
                      const timeDiff = Date.now() - item.timestamp;
                      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
                      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
                      
                      let timeText = 'Agora';
                      if (hoursAgo > 0) {
                        timeText = `${hoursAgo}h atrás`;
                      } else if (minutesAgo > 0) {
                        timeText = `${minutesAgo}min atrás`;
                      }
                      
                      return (
                        <button
                          key={`${item.id}-${item.timestamp}`}
                          onClick={() => handleItemClick(item.title)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-300 hover:bg-accent/50 hover:text-accent-foreground group ${
                            isOpen 
                              ? 'translate-y-0 opacity-100' 
                              : 'translate-y-2 opacity-0'
                          }`}
                          style={{
                            transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                          }}
                        >
                          <div className="p-1.5 rounded-md bg-accent/20 group-hover:bg-accent/30 transition-all duration-300">
                            <Icon className="h-3 w-3 text-accent-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium truncate block group-hover:text-accent-foreground">
                              {item.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {timeText}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="w-full h-px bg-border/30 mb-4" />
                </div>
              )}
              
              {/* Menu Principal */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 animate-slide-in">Todas as Funções</h3>
                
                {/* Home Item with enhanced animation */}
                <button
                  onClick={() => handleItemClick(null)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-500 hover:bg-primary/10 hover:text-primary group transform hover:scale-105 animate-bounce-in ${
                    isOpen 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-4 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isOpen ? `0ms` : '0ms'
                  }}
                >
                  <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/15 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Home className="h-5 w-5 group-hover:animate-pulse" />
                  </div>
                  <span className="font-medium group-hover:font-semibold transition-all duration-300">Início</span>
                  <div className="ml-auto w-2 h-2 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                </button>

                {/* All Functions with staggered animations */}
                {functions.map((func, index) => {
                  const Icon = getUniqueIconForFunction(func.funcao, index);
                  return (
                    <button
                      key={func.id}
                      onClick={() => handleItemClick(func.funcao)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-500 hover:bg-primary/10 hover:text-primary group transform hover:scale-105 animate-bounce-in hover:shadow-lg ${
                        isOpen 
                          ? 'translate-y-0 opacity-100' 
                          : 'translate-y-4 opacity-0'
                      }`}
                      style={{
                        transitionDelay: isOpen ? `${(index + 1) * 75}ms` : '0ms'
                      }}
                    >
                      <div className="p-2 rounded-lg bg-primary/15 border border-primary/30 group-hover:bg-primary/25 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden shadow-professional group-hover:shadow-glow">
                        <Icon className="h-5 w-5 text-primary group-hover:animate-pulse relative z-10" />
                        {/* Sparkle effect */}
                        <div className="absolute top-0 right-0 w-1 h-1 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500" />
                      </div>
                      <span className="font-medium text-sm group-hover:font-semibold transition-all duration-300 group-hover:text-primary">
                        {func.funcao}
                      </span>
                      {/* Arrow indicator */}
                      <div className="ml-auto w-2 h-2 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="p-6 border-t border-border/20 animate-fade-in">
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Conta</h3>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-3">
                  <User className="h-8 w-8 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{profile?.nome_completo}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSettingsClick}
                  className="flex-1 flex items-center gap-2 text-xs"
                >
                  <Settings className="h-3 w-3" />
                  Configurações
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1 flex items-center gap-2 text-xs text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-3 w-3" />
                  Sair
                </Button>
              </div>

              <div className="text-center pt-2">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 text-green-400 animate-pulse" />
                  <span>{functions.length} funções | {recentItems.length} recentes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações da Conta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={isUpdating}>
                {isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
