import { Share2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
interface ShareButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}
export const ShareButton = ({
  variant = 'ghost',
  size = 'icon',
  className = ''
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const url = window.location.href;
    const title = 'Direito Premium - Plataforma Jurídica';
    const text = 'Conheça a Direito Premium, sua plataforma jurídica completa com IA, biblioteca digital e muito mais!';

    // Tenta usar a Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        return;
      } catch (error) {
        // Se cancelar ou der erro, continua para o fallback
      }
    }

    // Fallback: copia para clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback do fallback: abre em nova janela
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
      title={copied ? 'Link copiado!' : 'Compartilhar'}
    >
      {copied ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </Button>
  );
};