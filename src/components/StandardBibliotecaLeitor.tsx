import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import { BotaoAudioRelaxante } from '@/components/BotaoAudioRelaxante';
import { motion } from 'framer-motion';
interface StandardLivro {
  id: number;
  imagem?: string;
  livro?: string;
  tema?: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  'capa-area'?: string;
  capaArea?: string;
  capaAreaLink?: string;
  'capa-livro'?: string;
  capaLivro?: string;
  capaLivroLink?: string;
}
interface StandardBibliotecaLeitorProps {
  livro: StandardLivro;
  onClose: () => void;
}
export const StandardBibliotecaLeitor = ({
  livro,
  onClose
}: StandardBibliotecaLeitorProps) => {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const getCapaLivro = () => {
    return livro.imagem || livro['capa-livro'] || livro.capaLivro || livro.capaLivroLink || (livro as any)['Capa-livro'];
  };
  const getTitulo = () => {
    return livro.livro || livro.tema || 'Material';
  };
  return <>
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAudioModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                Ouça o ambiente
              </Button>
              
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-hidden">
          {livro.link ? <div className="w-full h-full">
              <iframe src={livro.link} className="w-full h-full border-0" title={getTitulo()} loading="lazy" allow="fullscreen" />
            </div> : <div className="flex items-center justify-center h-full p-4 sm:p-8">
              <div className="text-center max-w-4xl w-full">
                {/* 1. Capa do livro centralizada e maior */}
                {getCapaLivro() && <div className="w-80 h-[28rem] sm:w-96 sm:h-[32rem] mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl">
                    <img src={getCapaLivro()!} alt={getTitulo()} className="w-full h-full object-cover" />
                  </div>}
                
                {/* 2. Nome do livro e autor */}
                <div className="mb-12">
                  <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-8">
                    {getTitulo()}
                  </h2>
                  
                  {livro.autor && <p className="text-2xl sm:text-3xl text-muted-foreground">
                      Autor: {livro.autor}
                    </p>}
                </div>
                
                {/* 3. Botões "Ler agora" e "Download" */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 max-w-lg mx-auto">
                  {livro.link && <Button variant="default" size="lg" onClick={() => window.open(livro.link, '_blank')} className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-6 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-xl">
                      📖 Ler agora
                    </Button>}
                  
                  {livro.download && <Button variant="outline" size="lg" onClick={() => window.open(livro.download, '_blank')} className="flex-1 border-2 border-foreground/20 hover:bg-muted/50 py-6 px-10 rounded-full font-bold transition-all duration-300 text-xl">
                      📥 Download
                    </Button>}
                  
                  {!livro.link && !livro.download && <div className="text-center py-4">
                      <Button variant="outline" size="lg" disabled className="flex-1 opacity-50 py-6 px-10 rounded-full text-xl">
                        📖 Em breve
                      </Button>
                    </div>}
                </div>
                
                {/* 4. Sobre o livro - com "ver mais" */}
                {livro.sobre && <div className="border-t border-border/30 pt-12 max-w-4xl mx-auto">
                    <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center">
                      Sobre o livro
                    </h3>
                    <div className="text-muted-foreground leading-relaxed text-left text-xl sm:text-2xl">
                      {livro.sobre.length > 300 ? <div>
                          <p className={showFullText ? '' : 'line-clamp-4'}>
                            {livro.sobre}
                          </p>
                          <Button variant="ghost" onClick={() => setShowFullText(!showFullText)} className="mt-4 text-primary hover:text-primary/80 text-lg flex items-center gap-2 mx-auto">
                            {showFullText ? <>
                                Ver menos
                                <ChevronUp className="h-4 w-4" />
                              </> : <>
                                Ver mais
                                <ChevronDown className="h-4 w-4" />
                              </>}
                          </Button>
                        </div> : <p>{livro.sobre}</p>}
                    </div>
                  </div>}
              </div>
            </div>}
        </div>

        {/* Rodapé com botão da Professora */}
        <div className="flex-shrink-0 border-t border-border/30 bg-background/95 backdrop-blur-sm">
          
        </div>
      </motion.div>
      
      {/* Modal de áudio relaxante controlado manualmente */}
      {showAudioModal && <div className="fixed inset-0 z-[60] pointer-events-none">
          <div className="pointer-events-auto">
            <BotaoAudioRelaxante />
          </div>
          <button onClick={() => setShowAudioModal(false)} className="fixed top-4 right-4 z-[70] pointer-events-auto bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>}
    </>;
};