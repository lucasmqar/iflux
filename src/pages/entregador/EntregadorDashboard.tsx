import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { getOrdersByDriver, getAvailableOrders, getUserById, getCompanyProfile } from '@/data/mockData';
import { ExpiredCreditBanner, PromoBanner } from '@/components/banners';
import { StatusBadge } from '@/components/StatusBadge';
import { getCompanyWhatsAppUrl, openWhatsApp, getAddCreditsWhatsAppUrl } from '@/lib/whatsapp';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck,
  DollarSign,
  MessageCircle,
  Eye,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatBrasiliaDateShort, PACKAGE_TYPE_LABELS } from '@/types';
import { toast } from 'sonner';

const EntregadorDashboard = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'driver') return null;

  const myOrders = getOrdersByDriver(user.id);
  const availableOrders = getAvailableOrders();
  
  const acceptedOrders = myOrders.filter(o => o.status === 'accepted');
  const driverCompletedOrders = myOrders.filter(o => o.status === 'driver_completed');
  const completedOrders = myOrders.filter(o => o.status === 'completed');

  const stats = {
    available: availableOrders.length,
    inProgress: acceptedOrders.length,
    completed: completedOrders.length,
  };

  // Estimated earnings
  const estimatedEarnings = completedOrders.reduce((sum, o) => sum + o.totalValue, 0);

  const handleAcceptOrder = async (orderId: string) => {
    if (!hasCredits) {
      toast.error('Você precisa de créditos para aceitar pedidos');
      navigate('/creditos');
      return;
    }
    // Simulate accepting
    toast.success('Pedido aceito!');
    navigate(`/pedido/${orderId}`);
  };

  const handleWhatsAppCompany = (companyUserId: string, orderId: string) => {
    const company = getUserById(companyUserId);
    if (company) {
      openWhatsApp(getCompanyWhatsAppUrl(company.phone, `#${orderId}`));
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
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Olá, {user.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Disponíveis"
            value={stats.available}
            icon={Clock}
            iconClassName="bg-amber-100"
            delay={0}
          />
          <StatsCard
            title="Em Andamento"
            value={stats.inProgress}
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
            title="Ganhos"
            value={`R$ ${estimatedEarnings.toFixed(2)}`}
            icon={DollarSign}
            iconClassName="bg-purple-100"
            delay={150}
          />
        </div>

        {/* DISPONÍVEIS */}
        {availableOrders.length > 0 && hasCredits && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Pedidos Disponíveis ({availableOrders.length})
            </h2>
            <div className="space-y-3">
              {availableOrders.map((order) => {
                const company = getUserById(order.companyUserId);
                const companyProfile = getCompanyProfile(order.companyUserId);
                
                return (
                  <div key={order.id} className="card-static p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{company?.name || companyProfile?.companyName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatBrasiliaDateShort(order.createdAt)}
                      </span>
                    </div>
                    
                    {companyProfile && (
                      <p className="text-sm text-muted-foreground mb-3">
                        📍 {companyProfile.addressDefault}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                      <span className="px-2 py-1 bg-secondary rounded text-muted-foreground">
                        {order.deliveries.length} entrega{order.deliveries.length > 1 ? 's' : ''}
                      </span>
                      {order.deliveries.slice(0, 3).map((d) => (
                        <span key={d.id} className="px-2 py-1 bg-secondary rounded text-muted-foreground">
                          {PACKAGE_TYPE_LABELS[d.packageType]}
                        </span>
                      ))}
                      <span className="font-semibold text-foreground ml-auto">
                        R$ {order.totalValue.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </Button>
                      <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>
                        <CheckCircle2 className="h-4 w-4" />
                        Aceitar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* EM ANDAMENTO */}
        {acceptedOrders.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Em Andamento ({acceptedOrders.length})
            </h2>
            <div className="space-y-3">
              {acceptedOrders.map((order) => {
                const company = getUserById(order.companyUserId);
                const companyProfile = getCompanyProfile(order.companyUserId);
                
                return (
                  <div key={order.id} className="card-static p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">Pedido #{order.id}</span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                    </div>
                    
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
                      <Button
                        size="sm"
                        className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
                        onClick={() => handleWhatsAppCompany(order.companyUserId, order.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{order.deliveries.length} entrega{order.deliveries.length > 1 ? 's' : ''}</span>
                      <span className="font-medium text-foreground">R$ {order.totalValue.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                        <CheckCircle2 className="h-4 w-4" />
                        Finalizar Pedido
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

        {/* AGUARDANDO CONFIRMAÇÃO DA EMPRESA */}
        {driverCompletedOrders.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Aguardando Confirmação ({driverCompletedOrders.length})
            </h2>
            <div className="space-y-3">
              {driverCompletedOrders.map((order) => {
                const company = getUserById(order.companyUserId);
                
                return (
                  <div key={order.id} className="card-static p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">Pedido #{order.id}</span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <span className="font-medium text-foreground">R$ {order.totalValue.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Aguardando {company?.name} confirmar o recebimento.
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CONCLUÍDOS */}
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

export default EntregadorDashboard;
