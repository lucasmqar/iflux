import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { getAvailableOrders, getUserById, getCompanyProfile } from '@/data/mockData';
import { formatBrasiliaDateShort, PACKAGE_TYPE_LABELS } from '@/types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Building2,
  Package,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PedidosDisponiveis = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'driver') return null;

  const availableOrders = getAvailableOrders();

  const handleAccept = (orderId: string) => {
    if (!hasCredits) {
      toast.error('Você precisa de créditos para aceitar pedidos');
      navigate('/creditos');
      return;
    }
    toast.success('Pedido aceito!');
    navigate(`/pedido/${orderId}`);
  };

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
          {availableOrders.map((order, index) => {
            const company = getUserById(order.companyUserId);
            const companyProfile = getCompanyProfile(order.companyUserId);
            
            return (
              <div
                key={order.id}
                className="card-static p-5 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{company?.name || companyProfile?.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatBrasiliaDateShort(order.createdAt)}
                  </div>
                </div>
                
                {companyProfile && (
                  <p className="text-sm text-muted-foreground mb-3">
                    📍 {companyProfile.addressDefault}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                  <span className="px-2 py-1 bg-secondary rounded text-muted-foreground">
                    {order.deliveries.length} entrega{order.deliveries.length > 1 ? 's' : ''}
                  </span>
                  {order.deliveries.slice(0, 3).map((d) => (
                    <span key={d.id} className="px-2 py-1 bg-secondary rounded text-muted-foreground">
                      {PACKAGE_TYPE_LABELS[d.packageType]}
                    </span>
                  ))}
                  <span className="font-semibold text-foreground ml-auto text-lg">
                    R$ {order.totalValue.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Button>
                  <Button size="sm" onClick={() => handleAccept(order.id)} disabled={!hasCredits}>
                    <CheckCircle2 className="h-4 w-4" />
                    Aceitar
                  </Button>
                </div>
              </div>
            );
          })}

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

export default PedidosDisponiveis;
