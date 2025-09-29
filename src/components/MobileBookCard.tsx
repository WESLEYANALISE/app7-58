import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Bookmark, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccessHistory } from '@/hooks/useAccessHistory';
import { useNavigate } from 'react-router-dom';

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

interface MobileBookCardProps {
  livro: LivroJuridico;
  onClick?: () => void;
}

export const MobileBookCard = ({ livro, onClick }: MobileBookCardProps) => {
  const { addToHistory } = useAccessHistory();
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Registrar no histórico
    addToHistory({
      id: `livro-${livro.id}`,
      title: `📚 ${livro.livro}`,
      icon: '📚'
    });

    // Navigate to book detail page
    navigate(`/book/${livro.id}`, { state: { book: livro } });

    if (onClick) {
      onClick();
    }
  };

  const handleAbrirLivro = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (livro.link) {
      window.open(livro.link, '_blank');
    }
    handleCardClick();
  };

  // Determine if book is a "classic" based on area or specific criteria
  const isClassic = livro.area?.includes('Civil') || livro.area?.includes('Constitucional') || livro.area?.includes('Penal') || true;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card 
        className="book-card-elegant w-full h-[280px] shadow-elegant hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={handleCardClick}
      >
        <CardContent className="p-4 h-full bg-gradient-to-br from-card/60 to-card/80">
          {/* Layout vertical para mobile seguindo a referência */}
          <div className="flex flex-col h-full">
            {/* Imagem do livro no topo */}
            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden shadow-lg border border-accent-legal/20">
              {(livro.imagem || (livro as any)['capa-livro']) ? (
                <img
                  src={livro.imagem || (livro as any)['capa-livro']}
                  alt={livro.livro}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-accent-legal/60" />
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 flex flex-col">
              {/* Título */}
              <div className="mb-2">
                <h3 className="gradient-text text-sm sm:text-lg font-bold leading-snug line-clamp-3">
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

              {/* Badges e botão */}
              <div className="space-y-2">
                {isClassic && (
                  <div className="flex justify-center">
                    <span className="classic-badge-mobile text-xs font-semibold px-3 py-1 rounded-full">
                      Clássico
                    </span>
                  </div>
                )}
                
                {/* Botão de ação */}
                {livro.link ? (
                  <Button
                    onClick={handleAbrirLivro}
                    className="abrir-livro-btn w-full font-semibold text-sm h-9"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Abrir livro
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full text-sm h-9 opacity-50 border-accent-legal/30"
                  >
                    Em breve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};