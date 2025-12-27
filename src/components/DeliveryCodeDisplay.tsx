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
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeliveryCodeDisplayProps {
  code: string;
  deliveryIndex: number;
  orderId?: string;
  customerPhone?: string;
  customerName?: string;
  isValidated?: boolean;
  codeSentAt?: string | null;
  alwaysVisible?: boolean;
}

export const DeliveryCodeDisplay = ({
  code,
  deliveryIndex,
  orderId,
  customerPhone,
  customerName,
  isValidated = false,
  codeSentAt,
  alwaysVisible = false,
}: DeliveryCodeDisplayProps) => {
  const [showCode, setShowCode] = useState(alwaysVisible);
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
    const orderShortId = orderId ? orderId.slice(0, 8) : '';
    
    // Mensagem clara e legível para o cliente
    const message = encodeURIComponent(
      `📦 *FLUX - Entrega a Caminho!*\n\n` +
      `Olá${customerName ? ` ${customerName}` : ''}!\n\n` +
      `Seu pedido está a caminho. Para confirmar o recebimento, você precisará informar o código abaixo ao entregador.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔐 *CÓDIGO DE ENTREGA:*\n` +
      `*${code}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      (orderShortId ? `📋 Pedido: #${orderShortId}\n\n` : '') +
      `⚠️ *IMPORTANTE:* Este código é único e confidencial. Informe-o *somente* ao entregador no momento da entrega.\n\n` +
      `Obrigado por confiar na FLUX! 🚚`
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

  const needsToSend = !codeSentAt;

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg border",
      needsToSend 
        ? "bg-orange-50 border-orange-300" 
        : "bg-amber-50 border-amber-200"
    )}>
      {/* Header com indicador de status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className={cn(
            "h-5 w-5",
            needsToSend ? "text-orange-600" : "text-amber-600"
          )} />
          <span className={cn(
            "text-sm font-medium",
            needsToSend ? "text-orange-800" : "text-amber-800"
          )}>
            Código de Validação - Entrega {deliveryIndex + 1}
          </span>
        </div>
        {codeSentAt && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Enviado
          </span>
        )}
      </div>

      {/* Alerta para enviar código */}
      {needsToSend && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-100 border border-orange-200">
          <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-orange-800">
              ⚠️ Ação necessária: Envie o código ao cliente!
            </p>
            <p className="text-xs text-orange-700">
              O cliente precisa deste código para confirmar o recebimento da entrega. 
              Clique no botão abaixo para enviar via WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Código */}
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "flex-1 font-mono text-2xl tracking-[0.3em] text-center py-2 px-4 rounded-lg",
            "bg-white border",
            needsToSend ? "border-orange-300" : "border-amber-300",
            showCode 
              ? (needsToSend ? "text-orange-900" : "text-amber-900")
              : "text-transparent bg-[repeating-linear-gradient(90deg,#d97706_0,#d97706_8px,transparent_8px,transparent_16px)]"
          )}
        >
          {showCode ? code : '●●●●●●'}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCode(!showCode)}
          className={cn(
            needsToSend 
              ? "border-orange-300 text-orange-700 hover:bg-orange-100"
              : "border-amber-300 text-amber-700 hover:bg-amber-100"
          )}
        >
          {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className={cn(
            needsToSend 
              ? "border-orange-300 text-orange-700 hover:bg-orange-100"
              : "border-amber-300 text-amber-700 hover:bg-amber-100"
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Botão WhatsApp destacado */}
      {customerPhone && (
        <Button
          size="sm"
          onClick={handleSendWhatsApp}
          className={cn(
            "w-full",
            needsToSend 
              ? "bg-[#25D366] hover:bg-[#20BD5A] text-white"
              : "bg-[#25D366]/80 hover:bg-[#25D366] text-white"
          )}
        >
          <Send className="h-4 w-4 mr-2" />
          {needsToSend ? 'Enviar código ao cliente via WhatsApp' : 'Reenviar código via WhatsApp'}
        </Button>
      )}

      <p className={cn(
        "text-xs text-center",
        needsToSend ? "text-orange-600" : "text-amber-600"
      )}>
        ⚠️ Este código só é visível para você. {needsToSend ? 'Envie ao cliente agora!' : 'O cliente usa para validar a entrega.'}
      </p>
    </div>
  );
};
