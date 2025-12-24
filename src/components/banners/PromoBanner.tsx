import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WHATSAPP_BASE_URL } from '@/lib/whatsapp';
import { Sparkles, X } from 'lucide-react';

interface PromoBannerProps {
  variant?: 'default' | 'compact';
}

export const PromoBanner = ({ variant = 'default' }: PromoBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleClick = () => {
    window.open(WHATSAPP_BASE_URL, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-3 flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">🎉 Promoção: Ative agora e libere 24h de uso!</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs h-7 px-2"
            onClick={handleClick}
          >
            Chamar no WhatsApp
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary to-accent text-white rounded-xl p-5 shadow-lg relative animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-white/20 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-lg">🎉 Promoção para novos usuários</p>
            <p className="text-sm text-white/90">
              Ative agora e libere 24h completas de uso!
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="w-full sm:w-auto bg-white text-primary hover:bg-white/90"
          onClick={handleClick}
        >
          Chamar no WhatsApp
        </Button>
      </div>
    </div>
  );
};
