import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { DeliveryCodeDisplay } from '@/components/DeliveryCodeDisplay';
import { 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderSuccessState {
  orderId: string;
  deliveryCodes: { [deliveryId: string]: string };
  deliveries: {
    id: string;
    dropoffAddress: string;
    packageType: string;
    suggestedPrice: number;
  }[];
  totalValue: number;
}

const PedidoCriado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedAll, setCopiedAll] = useState(false);
  
  const state = location.state as OrderSuccessState | null;

  if (!state) {
    navigate('/dashboard');
    return null;
  }

  const { orderId, deliveryCodes, deliveries, totalValue } = state;

  const handleCopyAllCodes = async () => {
    const codes = deliveries.map((d, i) => 
      `Entrega ${i + 1}: ${deliveryCodes[d.id]}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(codes);
      setCopiedAll(true);
      toast.success('Todos os códigos copiados!');
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4 py-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pedido Criado!</h1>
            <p className="text-muted-foreground">
              Pedido #{orderId.slice(0, 8)} • R$ {totalValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Important Warning */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Importante: Salve os códigos!</p>
            <p className="text-sm text-amber-700">
              Os códigos abaixo são únicos e só serão exibidos nesta tela. 
              Copie e envie para os clientes para que possam confirmar a entrega.
            </p>
          </div>
        </div>

        {/* Copy All Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleCopyAllCodes}
        >
          {copiedAll ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          Copiar Todos os Códigos
        </Button>

        {/* Delivery Codes */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-foreground">
            Códigos de Validação ({deliveries.length})
          </h2>
          
          {deliveries.map((delivery, index) => (
            <div key={delivery.id} className="card-static overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30">
                <p className="font-medium text-foreground">
                  Entrega {index + 1} - R$ {delivery.suggestedPrice.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {delivery.dropoffAddress}
                </p>
              </div>
              <div className="p-4">
                <DeliveryCodeDisplay
                  code={deliveryCodes[delivery.id]}
                  deliveryIndex={index}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate(`/pedido/${orderId}`)}
          >
            Ver Detalhes do Pedido
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PedidoCriado;
