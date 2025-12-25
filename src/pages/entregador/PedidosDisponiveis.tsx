import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useAvailableOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useCompanyProfile } from '@/hooks/useCompanyProfiles';
import { useProfile } from '@/hooks/useProfile';
import { formatBrasiliaDateShort, PACKAGE_TYPE_LABELS } from '@/types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Building2,
  Package,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PedidosDisponiveis = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();
  
  const { data: availableOrders = [], isLoading } = useAvailableOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  if (!user || user.role !== 'driver') return null;

  const handleAccept = async (orderId: string) => {
    if (!hasCredits) {
      toast.error('Você precisa de créditos para aceitar pedidos');
      navigate('/creditos');
      return;
    }
    
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: 'accepted',
        driverUserId: user.id,
      });
      toast.success('Pedido aceito!');
      navigate(`/pedido/${orderId}`);
    } catch (error) {
      toast.error('Erro ao aceitar pedido');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Pedidos Disponíveis</h1>
            <p className="text-muted-foreground">{availableOrders.length} pedidos aguardando</p>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {availableOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              index={index}
              onAccept={() => handleAccept(order.id)}
              onViewDetails={() => navigate(`/pedido/${order.id}`)}
              hasCredits={hasCredits}
              isPending={updateStatusMutation.isPending}
            />
          ))}

          {availableOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground mb-1">Nenhum pedido disponível</p>
              <p className="text-muted-foreground">Novos pedidos aparecerão aqui automaticamente</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

const OrderCard = ({ 
  order, 
  index,
  onAccept, 
  onViewDetails, 
  hasCredits,
  isPending 
}: { 
  order: any;
  index: number;
  onAccept: () => void; 
  onViewDetails: () => void;
  hasCredits: boolean;
  isPending: boolean;
}) => {
  const { data: companyProfile } = useCompanyProfile(order.company_user_id);
  const { data: profile } = useProfile(order.company_user_id);

  return (
    <div
      className="card-static p-5 opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">
            {companyProfile?.company_name || profile?.name || 'Empresa'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatBrasiliaDateShort(new Date(order.created_at))}
        </div>
      </div>
      
      {companyProfile?.address_default && (
        <p className="text-sm text-muted-foreground mb-3">
          📍 {companyProfile.address_default}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <span className="px-2 py-1 bg-secondary rounded text-muted-foreground">
          {order.order_deliveries?.length || 0} entrega{(order.order_deliveries?.length || 0) > 1 ? 's' : ''}
        </span>
        {order.order_deliveries?.slice(0, 3).map((d: any) => (
          <span key={d.id} className="px-2 py-1 bg-secondary rounded text-muted-foreground">
            {PACKAGE_TYPE_LABELS[d.package_type as keyof typeof PACKAGE_TYPE_LABELS]}
          </span>
        ))}
        <span className="font-semibold text-foreground ml-auto text-lg">
          R$ {order.total_value.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          <Eye className="h-4 w-4" />
          Detalhes
        </Button>
        <Button size="sm" onClick={onAccept} disabled={!hasCredits || isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Aceitar
        </Button>
      </div>
    </div>
  );
};

export default PedidosDisponiveis;
