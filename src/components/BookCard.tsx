
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumRequired } from './PremiumRequired';

interface BookCardProps {
  book: {
    area: string;
    livro: string;
    imagem: string;
    sobre: string;
    download: string;
    profissao: string;
    logo: string;
    'proficao do logo': string;
  };
  areaColor: string;
  getProfessionLogo: (profession: string) => string | null;
  showAreaBadge?: boolean;
}

export const BookCard = ({ book, areaColor, getProfessionLogo, showAreaBadge = false }: BookCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleCardClick = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(false);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (book.download) {
      window.open(book.download, '_blank');
    }
  };

  // Determine if book is a "classic" based on area or specific criteria
  const isClassic = book.area.includes('Civil') || book.area.includes('Constitucional') || book.area.includes('Penal');

  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <Card className="book-card-elegant h-full transition-all duration-300 border-l-4 overflow-hidden" 
              style={{ borderLeftColor: 'hsl(var(--primary))' }}>
          <CardContent className="p-4 bg-gradient-to-br from-card/50 to-card">
            <div className="flex gap-4 h-full">
              {/* Imagem do livro */}
              <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-primary/20">
                {book.imagem ? (
                  <img
                    src={book.imagem}
                    alt={book.livro}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary/60" />
                  </div>
                )}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="gradient-text font-bold text-lg leading-tight whitespace-nowrap overflow-hidden text-ellipsis pr-2">
                      {book.livro}
                    </h3>
                    <div className="flex flex-col gap-1 ml-2">
                      {isClassic && (
                        <Badge className="classic-badge text-xs flex-shrink-0 font-semibold">
                          Clássico
                        </Badge>
                      )}
                      {showAreaBadge && (
                        <Badge variant="outline" className="text-xs flex-shrink-0 border-primary/30 text-primary">
                          {book.area}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {book.sobre && (
                    <p className="text-sm text-muted-foreground/80 mb-3 line-clamp-2 leading-relaxed">
                      {book.sobre}
                    </p>
                  )}

                  {/* Profissões */}
                  {book.profissao && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 items-center">
                        {book.profissao.split(',').slice(0, 2).map((profession: string, idx: number) => {
                          const trimmedProfession = profession.trim();
                          const logo = getProfessionLogo(trimmedProfession);
                          return (
                            <div key={idx} className="flex items-center gap-1">
                              {logo && (
                                <div className="w-4 h-4 p-0.5 bg-background rounded-sm shadow-sm border border-primary/20">
                                  <img
                                    src={logo}
                                    alt={trimmedProfession}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs py-0 px-2 border-primary/30 text-primary/80">
                                {trimmedProfession}
                              </Badge>
                            </div>
                          );
                        })}
                        {book.profissao.split(',').length > 2 && (
                          <Badge variant="outline" className="text-xs py-0 px-2 border-primary/30 text-primary/60">
                            +{book.profissao.split(',').length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de download direto */}
                <div className="flex justify-end">
                  {book.download && (
                    <Button 
                      size="sm"
                      className="download-btn-elegant h-8 text-xs font-semibold"
                      onClick={handleDownloadClick}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="book-card-elegant rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h2 className="gradient-text text-2xl font-bold mb-3">
                      {book.livro}
                    </h2>
                    <div className="flex gap-2 mb-2">
                      {isClassic && (
                        <Badge className="classic-badge">
                          Clássico
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {book.area}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseDetails}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-6">
                {/* Imagem do livro */}
                <div className="w-32 h-44 flex-shrink-0 rounded-lg overflow-hidden shadow-xl border border-primary/20">
                  {book.imagem ? (
                    <img
                      src={book.imagem}
                      alt={book.livro}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary/60" />
                    </div>
                  )}
                </div>

                {/* Detalhes */}
                <div className="flex-1">
                  {book.sobre && (
                    <div className="mb-4">
                      <h3 className="gradient-text text-lg font-bold mb-3">Sinopse</h3>
                      <p className="text-muted-foreground/80 leading-relaxed">
                        {book.sobre}
                      </p>
                    </div>
                  )}

                  {/* Profissões */}
                  {book.profissao && (
                    <div className="mb-6">
                      <h3 className="gradient-text text-lg font-bold mb-3">Profissões Recomendadas</h3>
                      <div className="flex flex-wrap gap-2">
                        {book.profissao.split(',').map((profession: string, idx: number) => {
                          const trimmedProfession = profession.trim();
                          const logo = getProfessionLogo(trimmedProfession);
                          return (
                            <div key={idx} className="flex items-center gap-2 bg-card/60 border border-primary/20 rounded-lg p-3">
                              {logo && (
                                <div className="w-6 h-6 p-1 bg-background rounded-md shadow-sm border border-primary/20">
                                  <img
                                    src={logo}
                                    alt={trimmedProfession}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <span className="text-sm font-medium text-primary">{trimmedProfession}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Botão de download direto */}
                  {book.download && (
                    <Button 
                      className="download-btn-elegant w-full font-semibold text-base h-12"
                      onClick={handleDownloadClick}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download do Livro
                    </Button>
                  )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};
