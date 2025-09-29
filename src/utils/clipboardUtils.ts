/**
 * Função robusta para copiar texto que funciona em mobile, iframe e diferentes contextos
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Método 1: Clipboard API moderna (funciona na maioria dos casos)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API falhou, tentando método fallback:', err);
    }
  }

  // Método 2: Fallback para contextos inseguros ou iframe
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Estilo para tornar invisível mas acessível
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    textArea.setAttribute('contenteditable', 'true');
    
    document.body.appendChild(textArea);
    
    // Selecionar o texto
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    // Tentar copiar com execCommand (funciona em contextos legacy)
    const successful = document.execCommand('copy');
    
    // Limpar
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('Todos os métodos de cópia falharam:', err);
    return false;
  }
};

/**
 * Função para verificar se a cópia é suportada no ambiente atual
 */
export const isClipboardSupported = (): boolean => {
  return !!(navigator.clipboard || document.execCommand);
};

/**
 * Função para copiar com feedback visual melhorado
 */
export const copyWithFeedback = async (
  text: string, 
  onSuccess?: () => void, 
  onError?: (error: string) => void
): Promise<void> => {
  if (!isClipboardSupported()) {
    onError?.('Seu navegador não suporta cópia automática');
    return;
  }

  const success = await copyToClipboard(text);
  
  if (success) {
    onSuccess?.();
  } else {
    onError?.('Falha ao copiar o texto');
  }
};