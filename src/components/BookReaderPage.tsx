import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { ProfessoraIAEnhanced } from './ProfessoraIAEnhanced';
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
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="shrink-0"
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
      <div className="h-[calc(100vh-80px)]">
        <iframe 
          src={url} 
          className="w-full h-full border-0" 
          title={book.livro}
          loading="lazy"
        />
      </div>

      {/* Floating Professor Button */}
      <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      
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