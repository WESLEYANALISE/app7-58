import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { ProfessoraIAEnhanced } from './ProfessoraIAEnhanced';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';
import { useState } from 'react';

interface BookData {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  beneficios?: string;
  profissao?: string;
  logo?: string;
}

export const BookReaderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfessora, setShowProfessora] = useState(false);
  
  const { book, url } = location.state || {};

  if (!book || !url) {
    navigate(-1);
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/50 pointer-events-auto">
        <div className="flex items-center justify-between p-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(-1);
              }}
              className="shrink-0 relative z-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm leading-tight line-clamp-1">
                {book.livro}
              </h1>
              {book.autor && (
                <p className="text-xs text-muted-foreground">
                  por {book.autor}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className="h-[calc(100vh-80px)] relative">
        <iframe 
          src={url} 
          className="w-full h-full border-0 pointer-events-auto" 
          title={book.livro}
          loading="lazy"
        />
      </div>

      {/* Botão de Som Ambiente - canto inferior esquerdo */}
      <AmbientSoundPlayer />

      {/* Floating Professor Button - canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-40">
        <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      </div>
      
      {/* Professor AI Chat */}
      <ProfessoraIAEnhanced
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        bookContext={{
          livro: book.livro,
          autor: book.autor
        }}
        area={book.area}
      />
    </div>
  );
};