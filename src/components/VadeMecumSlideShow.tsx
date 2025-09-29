import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Slide {
  title: string;
  content: string;
  bulletPoints?: string[];
}

interface VadeMecumSlideShowProps {
  slides: Slide[];
  onClose: () => void;
  isOpen?: boolean;
  articleNumber?: string;
  codeName?: string;
  articleTitle?: string;
}

export const VadeMecumSlideShow: React.FC<VadeMecumSlideShowProps> = ({ 
  slides,
  onClose,
  isOpen,
  articleNumber,
  codeName,
  articleTitle
}) => {
  if (isOpen === false) return null;
  const displayTitle = articleTitle ?? ((codeName && articleNumber) ? `${codeName} - Art. ${articleNumber}` : 'Apresentação');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slideSpring = useSpring({
    opacity: 1,
    transform: 'translateX(0%)',
    from: { opacity: 0, transform: 'translateX(50px)' },
    reset: true,
    config: { tension: 300, friction: 30 }
  });

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') prevSlide();
    if (event.key === 'ArrowRight') nextSlide();
    if (event.key === 'Escape') onClose();
  }, [nextSlide, prevSlide, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="w-full max-w-6xl mx-4 relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-4 text-white shrink-0">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs">
              {displayTitle}
            </Badge>
            <div className="text-sm text-gray-300">
              Slide {currentSlide + 1} de {slides.length}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <AnimatePresence mode="wait">
            <animated.div
              key={currentSlide}
              style={slideSpring}
              className="w-full max-w-4xl"
            >
              <Card className="bg-gradient-to-br from-white to-gray-50 shadow-2xl min-h-[500px] flex flex-col">
                <CardContent className="p-12 flex-1 flex flex-col justify-center">
                  <motion.h3 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-gray-800 mb-8 text-center"
                  >
                    {slides[currentSlide].title}
                  </motion.h3>
                  
                  {slides[currentSlide].bulletPoints ? (
                    <ul className="space-y-4 text-gray-700 max-w-3xl mx-auto">
                      {slides[currentSlide].bulletPoints?.map((point, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 + 0.3 }}
                          className="flex items-start space-x-4"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-3 shrink-0" />
                          <span className="text-xl leading-relaxed">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl text-gray-700 leading-relaxed text-center max-w-3xl mx-auto"
                    >
                      {slides[currentSlide].content}
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </animated.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between py-4 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};