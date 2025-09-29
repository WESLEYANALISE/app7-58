import { useState } from 'react';
import { X } from 'lucide-react';
import { PremiumRequired } from './PremiumRequired';

const messageOptions = [
  {
    id: 'duvidas',
    title: 'Tenho dúvidas sobre produtos',
    message: 'Olá! Vim através da Loja de Direito e tenho algumas dúvidas sobre os produtos disponíveis. Podem me ajudar?'
  },
  {
    id: 'pedido',
    title: 'Acompanhar meu pedido',
    message: 'Olá! Gostaria de acompanhar o status do meu pedido feito na Loja de Direito. Podem me dar informações?'
  },
  {
    id: 'suporte',
    title: 'Preciso de suporte técnico',
    message: 'Olá! Estou com dificuldades técnicas relacionadas aos produtos da Loja de Direito. Podem me dar suporte?'
  },
  {
    id: 'recomendacao',
    title: 'Quero recomendações personalizadas',
    message: 'Olá! Gostaria de receber recomendações personalizadas de produtos da Loja de Direito para meus estudos jurídicos.'
  },
  {
    id: 'outro',
    title: 'Outro assunto',
    message: 'Olá! Vim através da Loja de Direito e gostaria de conversar sobre outros assuntos relacionados.'
  }
];

export const WhatsAppSupport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleWhatsAppClick = () => {
    setShowPremiumModal(true);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Botão Flutuante sem animação de piscar */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        aria-label="Suporte WhatsApp"
      >
        <img 
          src="https://imgur.com/bqSqrgT.png" 
          alt="WhatsApp" 
          className="h-8 w-8"
        />
      </button>

      {/* Modal de Suporte */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#25D366] to-[#20BA5A] text-white p-6 rounded-t-2xl relative">
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
                  <h3 className="text-xl font-bold">Suporte Loja de Direito</h3>
                  <p className="text-white/90 text-sm">Escolha o tipo de mensagem para enviar</p>
                </div>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Selecione uma das opções abaixo e sua mensagem será enviada automaticamente:
              </p>

              {/* Opções de Mensagens */}
              <div className="space-y-3 mb-6">
                {messageOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-[#25D366]/5 hover:border-[#25D366]/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#25D366]/20 group-hover:bg-[#25D366] rounded-full transition-colors duration-200"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-[#25D366] transition-colors">
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
                  Número: +55 (11) 99189-7603
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Premium */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[9999]">
          <PremiumRequired functionName="Conversar no WhatsApp" />
        </div>
      )}
    </>
  );
};