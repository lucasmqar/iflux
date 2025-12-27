import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { getOrdersByCompany, getOrdersByDriver, getUserById, getDriverProfile, getCompanyProfile } from '@/data/mockData';
import { getDriverWhatsAppUrl, getCompanyWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { OrderStatus, formatBrasiliaDateShort } from '@/types';
import { 
  ArrowLeft, 
  Eye, 
  XCircle, 
  MessageCircle,
  Building2,
  User,
  Package,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Aguardando' },
  { value: 'accepted', label: 'Aceitos' },
  { value: 'driver_completed', label: 'Entregues' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'cancelled', label: 'Cancelados' },
];

const MeusPedidos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') as OrderStatus | 'all' || 'all';
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(initialStatus);

  if (!user) return null;

  const orders = user.role === 'company' 
    ? getOrdersByCompany(user.id)
    : getOrdersByDriver(user.id);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const handleWhatsApp = (order: typeof orders[0]) => {
    if (user.role === 'company' && order.driverUserId) {
      const driver = getUserById(order.driverUserId);
      if (driver) {
        openWhatsApp(getDriverWhatsAppUrl(driver.phone, `#${order.id}`));
      }
    } else if (user.role === 'driver') {
      const company = getUserById(order.companyUserId);
      if (company) {
        openWhatsApp(getCompanyWhatsAppUrl(company.phone, `#${order.id}`));
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Meus Pedidos</h1>
            <p className="text-muted-foreground">{orders.length} pedidos</p>
          </div>
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

        {/* Orders list */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const driver = order.driverUserId ? getUserById(order.driverUserId) : null;
            const driverProfile = order.driverUserId ? getDriverProfile(order.driverUserId) : null;
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
                    <span className="font-mono font-semibold text-foreground">Pedido #{order.id}</span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatBrasiliaDateShort(order.createdAt)}
                  </span>
                </div>

                {/* Company info (for driver) */}
                {user.role === 'driver' && (
                  <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{company?.name || companyProfile?.companyName}</p>
                      {companyProfile && (
                        <p className="text-xs text-muted-foreground">{companyProfile.addressDefault}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Driver info (for company) */}
                {user.role === 'company' && driver && (
                  <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{driver.name}</p>
                      {driverProfile && (
                        <p className="text-xs text-muted-foreground">
                          {driverProfile.vehicleType === 'moto' ? '🏍️' : driverProfile.vehicleType === 'car' ? '🚗' : '🚲'} {driverProfile.vehicleModel} • {driverProfile.plate}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Deliveries summary */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" />
                    <span>{order.deliveries.length} entrega{order.deliveries.length > 1 ? 's' : ''}</span>
                  </div>
                  <span className="font-semibold text-foreground">R$ {order.totalValue.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Button>
                  
                  {['accepted', 'driver_completed'].includes(order.status) && (
                    <Button
                      size="sm"
                      className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
                      onClick={() => handleWhatsApp(order)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}

                  {user.role === 'company' && order.status === 'pending' && (
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MeusPedidos;
