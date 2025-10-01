import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, Brain, Sparkles } from 'lucide-react';
import { BotaoAudioRelaxante } from '@/components/BotaoAudioRelaxante';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { ProfessoraIAEnhanced } from './ProfessoraIAEnhanced';
import { ProgressIndicator } from './ProgressIndicator';
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

interface BibliotecaLeitorProps {
  livro: LivroJuridico;
  onClose: () => void;
}

export const BibliotecaLeitor = ({ livro, onClose }: BibliotecaLeitorProps) => {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showProfessora, setShowProfessora] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [explanationProgress, setExplanationProgress] = useState(0);

  const handleExplain = () => {
    setIsGeneratingExplanation(true);
    setExplanationProgress(0);
    
    // Simular progresso
    const interval = setInterval(() => {
      setExplanationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGeneratingExplanation(false);
          setShowProfessora(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center justify-between p-4 pointer-events-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="shrink-0 relative z-50"
            >
              <ArrowLeft className="h-5 w-5" />
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
      <div className="flex-1 overflow-hidden relative">
        {livro.link ? (
          <div className="w-full h-full">
            <iframe 
              src={livro.link} 
              className="w-full h-full border-0 pointer-events-auto" 
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
              
              {/* 3. Botões "Ler agora", "Download" e "Explicar" */}
              <div className="flex flex-col gap-4 justify-center mb-12 max-w-md mx-auto">
                {livro.link && (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => window.open(livro.link, '_blank')}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    📖 Ler agora
                  </Button>
                )}
                
                {livro.download && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open(livro.download, '_blank')}
                    className="w-full border-2 border-foreground/20 hover:bg-muted/50 py-3 px-6 rounded-full font-semibold transition-all duration-300"
                  >
                    📥 Download
                  </Button>
                )}
                
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleExplain}
                  disabled={isGeneratingExplanation}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Explicar
                </Button>
                
                {!livro.link && !livro.download && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled
                      className="w-full opacity-50 py-3 px-6 rounded-full"
                    >
                      📖 Em breve
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Indicador de progresso */}
              <AnimatePresence>
                {isGeneratingExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-8"
                  >
                    <ProgressIndicator 
                      progress={explanationProgress}
                      label="Gerando Explicação"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
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

      {/* Botão de Som Ambiente - canto inferior esquerdo */}
      <AmbientSoundPlayer />

      {/* Botão Flutuante da Professora IA - canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-40">
        <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      </div>

      {/* Chat da Professora IA */}
      <ProfessoraIAEnhanced
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
        bookContext={{
          livro: livro.livro,
          autor: livro.autor
        }}
        area={livro.area}
      />
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