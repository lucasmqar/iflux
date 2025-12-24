import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { getAvailableDeliveries } from '@/data/mockData';
import { Delivery } from '@/types';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  Package,
  CheckCircle,
  Building2,
  Navigation,
  Loader2,
} from 'lucide-react';

const EntregasDisponiveis = () => {
  const { user, hasCredits } = useAuth();
  const [deliveries] = useState<Delivery[]>(getAvailableDeliveries());
  const [accepting, setAccepting] = useState<string | null>(null);

  if (!user || user.role !== 'entregador') return null;

  const handleAccept = async (delivery: Delivery) => {
    if (!hasCredits) {
      toast.error('Você precisa de créditos para aceitar entregas');
      return;
    }

    setAccepting(delivery.id);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(`Entrega ${delivery.code} aceita!`, {
      description: 'Dirija-se ao endereço de coleta',
    });

    setAccepting(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Entregas Disponíveis</h1>
          <p className="text-muted-foreground">{deliveries.length} entregas aguardando</p>
        </div>

        {/* Deliveries list */}
        <div className="space-y-4">
          {deliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="card-static p-5 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">{delivery.code}</span>
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                    Disponível
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatTime(delivery.createdAt)}
                </div>
              </div>

              {/* Company */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{delivery.companyName}</span>
              </div>

              {/* Route */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-0.5 h-8 bg-border" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Coleta</p>
                    <p className="text-sm text-foreground">{delivery.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Entrega</p>
                    <p className="text-sm text-foreground">{delivery.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Item & Distance */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{delivery.itemDescription}</span>
                </div>
                {delivery.estimatedDistance && (
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{delivery.estimatedDistance}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {delivery.notes && (
                <div className="p-3 rounded-lg bg-secondary/50 mb-4 text-sm text-muted-foreground">
                  <strong>Obs:</strong> {delivery.notes}
                </div>
              )}

              {/* Accept button */}
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={() => handleAccept(delivery)}
                disabled={accepting === delivery.id || !hasCredits}
              >
                {accepting === delivery.id ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Aceitando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Aceitar Entrega
                  </>
                )}
              </Button>
            </div>
          ))}

          {deliveries.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground mb-1">Nenhuma entrega disponível</p>
              <p className="text-muted-foreground">Novas entregas aparecerão aqui automaticamente</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EntregasDisponiveis;
