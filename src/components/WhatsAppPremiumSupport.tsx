import { useState } from 'react';
import { X } from 'lucide-react';
import { PremiumRequired } from './PremiumRequired';

const premiumMessageOptions = [
  {
    id: 'premium-info',
    title: 'Quero saber sobre o Premium',
    message: 'Olá! Estou interessado na versão Premium do app Direito. Podem me explicar os benefícios e funcionalidades?'
  },
  {
    id: 'premium-preco',
    title: 'Dúvidas sobre preço e pagamento',
    message: 'Olá! Gostaria de saber sobre o preço da versão Premium. Como funciona o pagamento único vitalício?'
  },
  {
    id: 'premium-diferenca',
    title: 'Qual a diferença da versão gratuita?',
    message: 'Olá! Quero entender quais são as principais diferenças entre a versão gratuita e a Premium do app.'
  },
  {
    id: 'premium-vale-pena',
    title: 'Vale a pena comprar?',
    message: 'Olá! Estou em dúvida se vale a pena investir na versão Premium. Podem me dar mais detalhes?'
  },
  {
    id: 'premium-como-comprar',
    title: 'Como posso comprar?',
    message: 'Olá! Quero comprar a versão Premium. Como faço para adquirir e ativar no meu dispositivo?'
  },
  {
    id: 'premium-desconto',
    title: 'Há algum desconto disponível?',
    message: 'Olá! Gostaria de saber se há alguma promoção ou desconto disponível para a versão Premium.'
  }
];

export const WhatsAppPremiumSupport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleWhatsAppClick = () => {
    setShowPremiumModal(true);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Botão Flutuante Premium */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-premium-primary to-premium-accent hover:from-premium-accent hover:to-premium-secondary text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 animate-premium-glow"
        aria-label="Suporte Premium WhatsApp"
      >
        <img 
          src="https://imgur.com/bqSqrgT.png" 
          alt="WhatsApp" 
          className="h-8 w-8"
        />
      </button>

      {/* Modal de Suporte Premium */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header do Modal Premium */}
            <div className="bg-gradient-to-r from-premium-primary via-premium-accent to-premium-secondary text-white p-6 rounded-t-2xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <img 
                    src="https://imgur.com/bqSqrgT.png" 
                    alt="WhatsApp" 
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Dúvidas sobre Premium 👑</h3>
                  <p className="text-white/90 text-sm">Tire suas dúvidas sobre a versão Premium</p>
                </div>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Selecione o tipo de dúvida sobre a versão Premium:
              </p>

              {/* Opções de Mensagens Premium */}
              <div className="space-y-3 mb-6">
                {premiumMessageOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-premium-primary/5 hover:border-premium-primary/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-premium-primary/20 group-hover:bg-premium-primary rounded-full transition-colors duration-200"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-premium-primary transition-colors">
                          {option.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {option.message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Botão Fechar */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>

              {/* Informação do Número */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Vendas Premium: +55 (11) 99189-7603
                </p>
                <p className="text-xs text-premium-primary font-medium mt-1">
                  💬 Entre em contato para adquirir a versão Premium
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Premium */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[9999]">
          <PremiumRequired functionName="IA Premium" />
        </div>
      )}
    </>
  );
};