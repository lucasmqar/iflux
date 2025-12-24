import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { mockOrders, getUserById } from '@/data/mockData';
import { formatBrasiliaDateShort } from '@/types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Eye,
  Trash2,
  Building2,
  User,
  Package,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GerenciarPedidos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') return null;

  const handleDelete = (orderId: string) => {
    toast.success('Pedido excluído');
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
            <h1 className="text-2xl font-semibold text-foreground">Gerenciar Pedidos</h1>
            <p className="text-muted-foreground">{mockOrders.length} pedidos</p>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {mockOrders.map((order, index) => {
            const company = getUserById(order.companyUserId);
            const driver = order.driverUserId ? getUserById(order.driverUserId) : null;

            return (
              <div
                key={order.id}
                className="card-static p-4 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold">#{order.id}</span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatBrasiliaDateShort(order.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Empresa:</span>
                    <span className="font-medium text-foreground">{company?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Entregador:</span>
                    <span className="font-medium text-foreground">{driver?.name || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{order.deliveries.length} entregas</span>
                  </div>
                  <span className="font-semibold text-foreground">R$ {order.totalValue.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default GerenciarPedidos;
