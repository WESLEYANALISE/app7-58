import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, Brain } from 'lucide-react';
import { BotaoAudioRelaxante } from '@/components/BotaoAudioRelaxante';
import { motion } from 'framer-motion';

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

interface BibliotecaLeitorProps {
  livro: LivroJuridico;
  onClose: () => void;
}

export const BibliotecaLeitor = ({ livro, onClose }: BibliotecaLeitorProps) => {
  const [showAudioModal, setShowAudioModal] = useState(false);

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAudioModal(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-accent-foreground border-accent"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              Som Ambiente
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-hidden">
        {livro.link ? (
          <div className="w-full h-full">
            <iframe 
              src={livro.link} 
              className="w-full h-full border-0" 
              title={livro.livro}
              loading="lazy"
              allow="fullscreen"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl p-8 w-full">
              {/* 1. Capa do livro centralizada */}
              {(livro.imagem || (livro as any)['capa-livro']) && (
                <div className="w-64 h-80 mx-auto mb-8 rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={livro.imagem || (livro as any)['capa-livro']}
                    alt={livro.livro}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* 2. Nome do livro e autor */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  {livro.livro}
                </h2>
                
                {livro.autor && (
                  <p className="text-xl text-muted-foreground">
                    Autor: {livro.autor}
                  </p>
                )}
              </div>
              
              {/* 3. Botões "Ler agora" e "Download" */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-md mx-auto">
                {livro.link && (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => window.open(livro.link, '_blank')}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    📖 Ler agora
                  </Button>
                )}
                
                {livro.download && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open(livro.download, '_blank')}
                    className="flex-1 border-2 border-foreground/20 hover:bg-muted/50 py-3 px-6 rounded-full font-semibold transition-all duration-300"
                  >
                    📥 Download
                  </Button>
                )}
                
                {!livro.link && !livro.download && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled
                      className="flex-1 opacity-50 py-3 px-6 rounded-full"
                    >
                      📖 Em breve
                    </Button>
                  </div>
                )}
              </div>
              
              {/* 4. Sobre o livro - abaixo dos botões */}
              {livro.sobre && (
                <div className="border-t border-border/30 pt-8 max-w-3xl mx-auto">
                  <h3 className="text-2xl font-semibold text-foreground mb-4 text-center">
                    Sobre o livro
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-left text-lg">
                    {livro.sobre}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé com botão da Professora */}
      <div className="flex-shrink-0 border-t border-border/30 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-center p-4">
          <Button
            variant="default"
            size="lg"
            onClick={() => {
              // Usar a mesma lógica do FloatingProfessoraButton
              const event = new CustomEvent('openProfessoraChat', {
                detail: { livro, area: livro.area }
              });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </div>
            Perguntar sobre o livro
          </Button>
        </div>
      </div>
    </motion.div>
    
    {/* Modal de áudio relaxante controlado manualmente */}
    {showAudioModal && (
      <div className="fixed inset-0 z-[60] pointer-events-none">
        <div className="pointer-events-auto">
          <BotaoAudioRelaxante />
        </div>
        <button 
          onClick={() => setShowAudioModal(false)}
          className="fixed top-4 right-4 z-[70] pointer-events-auto bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}
    </>
  );
};