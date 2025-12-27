import { useState } from 'react';
import { WHATSAPP_BASE_URL } from '@/lib/whatsapp';
import { MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketingBannerProps {
  collapsible?: boolean;
}

export const MarketingBanner = ({ collapsible = false }: MarketingBannerProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleClick = () => {
    window.open(WHATSAPP_BASE_URL, '_blank', 'noopener,noreferrer');
  };

  if (collapsible && collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[hsl(142_70%_45%)] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[hsl(142_70%_40%)] transition-colors animate-fade-in"
      >
        <MessageCircle className="h-5 w-5" />
        <ChevronUp className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="bg-[hsl(142_70%_45%)] text-white dark:text-gray-900 px-4 py-2.5 animate-fade-in">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            Precisa de ajuda ou créditos? Fale direto com o FLUX no WhatsApp.
          </span>
        </button>
        {collapsible && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-black/10 dark:hover:bg-black/20 rounded-md transition-colors"
            aria-label="Minimizar"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
