import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { getOrdersByCompany, getUserById, getDriverProfile } from '@/data/mockData';
import { ExpiredCreditBanner, PromoBanner } from '@/components/banners';
import { StatusBadge } from '@/components/StatusBadge';
import { getDriverWhatsAppUrl, openWhatsApp, getAddCreditsWhatsAppUrl } from '@/lib/whatsapp';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Plus,
  CreditCard,
  MessageCircle,
  Eye,
  User,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatBrasiliaDateShort } from '@/types';

const EmpresaDashboard = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'company') return null;

  const orders = getOrdersByCompany(user.id);
  
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const acceptedOrders = orders.filter(o => o.status === 'accepted');
  const driverCompletedOrders = orders.filter(o => o.status === 'driver_completed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const stats = {
    pending: pendingOrders.length,
    accepted: acceptedOrders.length,
    completed: completedOrders.length,
    cancelled: cancelledOrders.length,
  };

  const handleWhatsAppDriver = (driverUserId: string, orderId: string) => {
    const driver = getUserById(driverUserId);
    if (driver) {
      openWhatsApp(getDriverWhatsAppUrl(driver.phone, `#${orderId}`));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Expired credit banner */}
        <ExpiredCreditBanner />

        {/* Promo banner */}
        {hasCredits && <PromoBanner variant="compact" />}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Olá, {user.name}</p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/novo-pedido')}
            disabled={!hasCredits}
          >
            <Plus className="h-5 w-5" />
            Novo Pedido
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Aguardando"
            value={stats.pending}
            icon={Clock}
            iconClassName="bg-amber-100"
            delay={0}
          />
          <StatsCard
            title="Em Andamento"
            value={stats.accepted}
            icon={Truck}
            iconClassName="bg-blue-100"
            delay={50}
          />
          <StatsCard
            title="Concluídos"
            value={stats.completed}
            icon={CheckCircle2}
            iconClassName="bg-emerald-100"
            delay={100}
          />
          <StatsCard
            title="Cancelados"
            value={stats.cancelled}
            icon={XCircle}
            iconClassName="bg-red-100"
            delay={150}
          />
        </div>

        {/* SOLICITAÇÕES - Aguardando aceitar */}
        {pendingOrders.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Aguardando Entregador ({pendingOrders.length})
            </h2>
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order.id} className="card-static p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold">Pedido #{order.id}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatBrasiliaDateShort(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>{order.deliveries.length} entrega{order.deliveries.length > 1 ? 's' : ''}</span>
                    <span className="font-medium text-foreground">R$ {order.totalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                      <Eye className="h-4 w-4" />
                      Detalhes
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACEITAS / EM ANDAMENTO */}
        {acceptedOrders.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Em Andamento ({acceptedOrders.length})
            </h2>
            <div className="space-y-3">
              {acceptedOrders.map((order) => {
                const driver = order.driverUserId ? getUserById(order.driverUserId) : null;
                const driverProfile = order.driverUserId ? getDriverProfile(order.driverUserId) : null;
                
                return (
                  <div key={order.id} className="card-static p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">Pedido #{order.id}</span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatBrasiliaDateShort(order.createdAt)}
                      </span>
                    </div>
                    
                    {driver && (
                      <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-secondary/50">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{driver.name}</p>
                          {driverProfile && (
                            <p className="text-xs text-muted-foreground">
                              {driverProfile.vehicleType === 'moto' ? '🏍️' : driverProfile.vehicleType === 'car' ? '🚗' : '🚲'} {driverProfile.vehicleModel} • {driverProfile.plate}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
                          onClick={() => handleWhatsAppDriver(order.driverUserId!, order.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{order.deliveries.length} entrega{order.deliveries.length > 1 ? 's' : ''}</span>
                      <span className="font-medium text-foreground">R$ {order.totalValue.toFixed(2)}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* AGUARDANDO CONFIRMAÇÃO */}
        {driverCompletedOrders.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              Aguardando Confirmação ({driverCompletedOrders.length})
            </h2>
            <div className="space-y-3">
              {driverCompletedOrders.map((order) => {
                const driver = order.driverUserId ? getUserById(order.driverUserId) : null;
                
                return (
                  <div key={order.id} className="card-static p-4 border-2 border-purple-200 bg-purple-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">Pedido #{order.id}</span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-purple-700 mb-3">
                      Entregador <strong>{driver?.name}</strong> finalizou. Confirme o recebimento.
                    </p>

                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar Recebimento
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CONCLUÍDAS */}
        {completedOrders.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Concluídos
              </h2>
              {completedOrders.length > 3 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/meus-pedidos?status=completed')}>
                  Ver todos ({completedOrders.length})
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {completedOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="card-static p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold">Pedido #{order.id}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">R$ {order.totalValue.toFixed(2)}</span>
                      <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banners */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-static p-5 bg-gradient-to-br from-neutral-900 to-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-2">Pacote 3 meses</h3>
            <p className="text-neutral-300 text-sm mb-4">Economize com o plano trimestral</p>
            <Button
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
              onClick={() => openWhatsApp(getAddCreditsWhatsAppUrl(user))}
            >
              <MessageCircle className="h-4 w-4" />
              Contratar via WhatsApp
            </Button>
          </div>
          <div className="card-static p-5 bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-amber-500">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">Pacote 6 meses</h3>
              <span className="text-xs bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-medium">Melhor oferta</span>
            </div>
            <p className="text-neutral-300 text-sm mb-4">Máxima economia no plano semestral</p>
            <Button
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
              onClick={() => openWhatsApp(getAddCreditsWhatsAppUrl(user))}
            >
              <MessageCircle className="h-4 w-4" />
              Contratar via WhatsApp
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default EmpresaDashboard;
