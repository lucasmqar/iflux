import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check,
  Send,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeliveryCodeDisplayProps {
  code: string;
  deliveryIndex: number;
  customerPhone?: string;
  customerName?: string;
  isValidated?: boolean;
  codeSentAt?: string | null;
}

export const DeliveryCodeDisplay = ({
  code,
  deliveryIndex,
  customerPhone,
  customerName,
  isValidated = false,
  codeSentAt,
}: DeliveryCodeDisplayProps) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleSendWhatsApp = () => {
    if (!customerPhone) {
      toast.error('Telefone do cliente não disponível');
      return;
    }
    
    const phone = customerPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá${customerName ? ` ${customerName}` : ''}! 🚚\n\n` +
      `Seu código de entrega é: *${code}*\n\n` +
      `Por favor, informe este código ao entregador para confirmar o recebimento.\n\n` +
      `⚠️ Não compartilhe este código com ninguém além do entregador.`
    );
    
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    toast.success('WhatsApp aberto para envio do código');
  };

  if (isValidated) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-800">Entrega validada</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            Código de Validação - Entrega {deliveryIndex + 1}
          </span>
        </div>
        {codeSentAt && (
          <span className="text-xs text-amber-600">
            Enviado em {new Date(codeSentAt).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "flex-1 font-mono text-2xl tracking-[0.3em] text-center py-2 px-4 rounded-lg",
            "bg-white border border-amber-300",
            showCode ? "text-amber-900" : "text-transparent bg-[repeating-linear-gradient(90deg,#d97706_0,#d97706_8px,transparent_8px,transparent_16px)]"
          )}
        >
          {showCode ? code : '●●●●●●'}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCode(!showCode)}
          className="border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {customerPhone && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendWhatsApp}
          className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar código via WhatsApp
        </Button>
      )}

      <p className="text-xs text-amber-600 text-center">
        ⚠️ Este código só é visível para você. Envie ao cliente para validar a entrega.
      </p>
    </div>
  );
};
