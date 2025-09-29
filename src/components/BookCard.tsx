
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleCardClick = () => {
    // Navigate to full page instead of modal
    navigate(`/book/${book.livro}`, { state: { book } });
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


    </>
  );
};
