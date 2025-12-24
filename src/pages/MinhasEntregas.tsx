import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { getCompanyDeliveries, getDelivererDeliveries } from '@/data/mockData';
import { Delivery, DeliveryStatus } from '@/types';
import { DeliveryInProgressBanner } from '@/components/banners';
import { getDeliveryProblemWhatsAppUrl, getOrderHelpWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  User,
  Eye,
  XCircle,
  Package,
  ArrowRight,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusFilters: { value: DeliveryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'ABERTA', label: 'Abertas' },
  { value: 'ACEITA', label: 'Aceitas' },
  { value: 'COLETADA', label: 'Coletadas' },
  { value: 'CONCLUIDA', label: 'Concluídas' },
  { value: 'CANCELADA', label: 'Canceladas' },
];

const MinhasEntregas = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');

  if (!user) return null;

  // Get deliveries based on user role
  const deliveries = user.role === 'empresa' 
    ? getCompanyDeliveries(user.id)
    : getDelivererDeliveries(user.id);

  const filteredDeliveries = statusFilter === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === statusFilter);

  // Check if there's any delivery in COLETADA status
  const hasDeliveryInProgress = deliveries.some(d => d.status === 'COLETADA');

  const handleHelp = (delivery: Delivery) => {
    if (user.role === 'empresa') {
      openWhatsApp(getOrderHelpWhatsAppUrl(delivery.code));
    } else {
      openWhatsApp(getDeliveryProblemWhatsAppUrl(delivery.code));
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = (delivery: Delivery) => {
    // Check cancellation rules
    if (user.role === 'empresa' && delivery.status !== 'ABERTA') {
      toast.error('Não é possível cancelar', {
        description: 'Só é possível cancelar entregas com status "Aberta"',
      });
      return;
    }

    if (user.role === 'entregador' && delivery.status !== 'ACEITA') {
      toast.error('Não é possível cancelar', {
        description: 'Só é possível cancelar antes de confirmar a coleta',
      });
      return;
    }

    toast.success('Entrega cancelada');
  };

  const canCancel = (delivery: Delivery) => {
    if (user.role === 'empresa') {
      return delivery.status === 'ABERTA';
    }
    if (user.role === 'entregador') {
      return delivery.status === 'ACEITA';
    }
    return false;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Contextual banner for delivery in progress */}
        {user.role === 'entregador' && hasDeliveryInProgress && (
          <DeliveryInProgressBanner />
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Entregas</h1>
          <p className="text-muted-foreground">{deliveries.length} entregas</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Deliveries list */}
        <div className="space-y-4">
          {filteredDeliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="card-static p-5 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">{delivery.code}</span>
                  <StatusBadge status={delivery.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDate(delivery.createdAt)}
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Coleta</p>
                    <p className="text-sm text-foreground">{delivery.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Entrega</p>
                    <p className="text-sm text-foreground">{delivery.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Item */}
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{delivery.itemDescription}</span>
              </div>

              {/* Delivery person (for company view) */}
              {user.role === 'empresa' && delivery.deliveryPersonName && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Entregador: <span className="text-foreground">{delivery.deliveryPersonName}</span>
                  </span>
                </div>
              )}

              {/* Distance */}
              {delivery.estimatedDistance && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Distância estimada: <span className="text-foreground">{delivery.estimatedDistance}</span>
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelp(delivery)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {user.role === 'empresa' ? 'Ajuda' : 'Problema na entrega?'}
                </Button>
                {canCancel(delivery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleCancel(delivery)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma entrega encontrada</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MinhasEntregas;
