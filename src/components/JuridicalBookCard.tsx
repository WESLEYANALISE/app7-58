import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
}

interface JuridicalBookCardProps {
  livro: LivroJuridico;
  showAreaBadge?: boolean;
  onClick?: () => void;
}

export const JuridicalBookCard = ({ livro, showAreaBadge = false, onClick }: JuridicalBookCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetails(true);
    }
  };

  const handleCloseDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(false);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (livro.download) {
      window.open(livro.download, '_blank');
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (livro.link) {
      setShowLinkModal(true);
    }
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
  };

  // Determine if book is a "classic" based on area or specific criteria
  const isClassic = livro.area?.includes('Civil') || livro.area?.includes('Constitucional') || livro.area?.includes('Penal') || true;

  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <Card className="book-card-elegant h-80 shadow-elegant hover:shadow-glow transition-all duration-300 overflow-hidden">
          <CardContent className="p-4 h-full bg-gradient-to-br from-card/60 to-card/80">
            {/* Layout vertical - similar ao MobileBookCard */}
            <div className="flex flex-col h-full">
              {/* Imagem do livro no topo */}
              <div className="w-full h-32 mb-3 rounded-lg overflow-hidden shadow-lg border border-accent-legal/20">
                {livro.imagem || (livro as any)['capa-livro'] ? (
                  <img
                    src={livro.imagem || (livro as any)['capa-livro']}
                    alt={livro.livro}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-accent-legal/60" />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col">
                {/* Título */}
                <div className="mb-2">
                  <h3 className="gradient-text text-sm sm:text-base lg:text-lg font-bold leading-snug line-clamp-3" title={livro.livro}>
                    {livro.livro}
                  </h3>
                </div>

                {/* Autor */}
                <div className="mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
                    {livro.autor || 'Autor não especificado'}
                  </p>
                </div>

                {/* Descrição */}
                <div className="flex-1 mb-3">
                  {livro.sobre && (
                    <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">
                      {livro.sobre}
                    </p>
                  )}
                </div>

                {/* Badges e botões */}
                <div className="space-y-2">
                  {isClassic && (
                    <div className="flex justify-center">
                      <span className="classic-badge text-xs font-semibold px-3 py-1 rounded-full">
                        Clássico
                      </span>
                    </div>
                  )}
                  
                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    {livro.link && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8 border-accent-legal/30"
                        onClick={handleLinkClick}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ler
                      </Button>
                    )}
                    {livro.download ? (
                      <Button 
                        size="sm"
                        className="abrir-livro-btn flex-1 text-xs h-8"
                        onClick={handleDownloadClick}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Baixar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                        className="flex-1 text-xs h-8 opacity-50 border-accent-legal/30"
                      >
                        Em breve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={handleCloseDetails} />

            {/* Fullscreen Reader-like Layout */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 bg-background flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header com apenas o botão de fechar */}
              <div className="flex items-center justify-end p-4 border-b border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseDetails}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Conteúdo principal em tela cheia */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl w-full mx-auto p-8">
                  {/* 1. Capa centralizada */}
                  <div className="text-center mb-12">
                    {(livro.imagem || (livro as any)['capa-livro']) && (
                      <div className="w-80 h-96 mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl">
                        <img src={livro.imagem || (livro as any)['capa-livro']} alt={livro.livro} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* 2. Nome do livro e autor */}
                    <div className="mb-8">
                      <h2 className="text-5xl font-bold text-foreground mb-4 leading-tight">{livro.livro}</h2>
                      {livro.autor && (
                        <p className="text-2xl text-muted-foreground font-medium">Por {livro.autor}</p>
                      )}
                    </div>

                    {/* 3. Botões de ação */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 max-w-lg mx-auto">
                      {livro.link && (
                        <Button
                          variant="default"
                          size="lg"
                          onClick={handleLinkClick}
                          className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                        >
                          📖 Ler agora
                        </Button>
                      )}
                      {livro.download && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleDownloadClick}
                          className="flex-1 border-2 border-border hover:bg-muted/50 py-4 px-8 rounded-full font-semibold transition-all duration-300 text-lg"
                        >
                          📥 Download
                        </Button>
                      )}
                      {!livro.link && !livro.download && (
                        <Button variant="outline" size="lg" disabled className="flex-1 opacity-50 py-4 px-8 rounded-full text-lg">
                          📖 Em breve
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 4. Sobre o livro - por último */}
                  {livro.sobre && (
                    <div className="border-t border-border/30 pt-12">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-3xl font-bold text-foreground mb-8 text-center">Sobre o livro</h3>
                        <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                          <p className="text-xl leading-loose">{livro.sobre}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para visualizar o link dentro do app */}
      <AnimatePresence>
        {showLinkModal && livro.link && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeLinkModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg w-full h-[90vh] max-w-6xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold">{livro.livro}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeLinkModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <iframe 
                src={livro.link} 
                className="w-full flex-1 h-[calc(90vh-80px)]" 
                title={livro.livro}
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};