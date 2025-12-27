import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { ClickableStatsCard } from '@/components/ClickableStatsCard';
import { Button } from '@/components/ui/button';
import { useDriverOrders, useAvailableOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import { useCompanyProfile } from '@/hooks/useCompanyProfiles';
import { ExpiredCreditBanner, PromoBanner } from '@/components/banners';
import { StatusBadge } from '@/components/StatusBadge';
import { openWhatsApp, getAddCreditsWhatsAppUrl } from '@/lib/whatsapp';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
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
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatBrasiliaDateShort, PACKAGE_TYPE_LABELS } from '@/types';
import { formatOrderCode } from '@/lib/utils';
import { toast } from 'sonner';

const EntregadorDashboard = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Enable realtime notifications
  useRealtimeNotifications(user?.id, user?.role ?? undefined);

  // Real-time subscription para pedidos disponíveis
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-available-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
          queryClient.invalidateQueries({ queryKey: ['orders', 'driver', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  // Use real data from Supabase
  const { data: myOrders = [], isLoading: ordersLoading } = useDriverOrders(user?.id);
  const { data: availableOrders = [], isLoading: availableLoading } = useAvailableOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  if (!user || user.role !== 'driver') return null;

  const isLoading = ordersLoading || availableLoading;
  
  const acceptedOrders = myOrders.filter(o => o.status === 'accepted');
  const driverCompletedOrders = myOrders.filter(o => o.status === 'driver_completed');
  const completedOrders = myOrders.filter(o => o.status === 'completed');

  const stats = {
    available: availableOrders.length,
    inProgress: acceptedOrders.length,
    completed: completedOrders.length,
  };

  // Estimated earnings
  const estimatedEarnings = completedOrders.reduce((sum, o) => sum + o.total_value, 0);

  const handleAcceptOrder = async (orderId: string) => {
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

  const handleWhatsAppCompany = (companyPhone: string, orderId: string) => {
    if (companyPhone) {
      const url = `https://wa.me/55${companyPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Sou o entregador do pedido ${formatOrderCode(orderId)}`)}`;
      window.open(url, '_blank');
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
      <div className="space-y-8 overflow-x-hidden">
        {/* Expired credit banner */}
        <ExpiredCreditBanner />

        {/* Promo banner */}
        {hasCredits && <PromoBanner variant="compact" />}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Olá, {user.name}</p>
        </div>

        {/* Stats - Clickable - 4 Views */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ClickableStatsCard
            title="Disponíveis"
            value={stats.available}
            icon={Clock}
            iconClassName="bg-status-open/15 text-status-open"
            delay={0}
            href="/pedidos-disponiveis"
          />
          <ClickableStatsCard
            title="Em Andamento"
            value={stats.inProgress}
            icon={Truck}
            iconClassName="bg-status-accepted/15 text-status-accepted"
            delay={50}
            href="/pedidos-aceitos"
          />
          <ClickableStatsCard
            title="Aguardando"
            value={driverCompletedOrders.length}
            icon={Package}
            iconClassName="bg-status-collected/15 text-status-collected"
            delay={100}
            href="/pedidos-finalizados"
          />
          <ClickableStatsCard
            title="Concluídos"
            value={stats.completed}
            icon={CheckCircle2}
            iconClassName="bg-status-completed/15 text-status-completed"
            delay={150}
            href="/entregador/concluidos"
          />
        </div>

        {/* DISPONÍVEIS */}
        {availableOrders.length > 0 && hasCredits && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Pedidos Disponíveis ({availableOrders.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/pedidos-disponiveis')}>
                Ver todos ({availableOrders.length})
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {availableOrders.slice(0, 3).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAccept={() => handleAcceptOrder(order.id)}
                  onViewDetails={() => navigate(`/pedido/${order.id}`)}
                  hasCredits={hasCredits}
                  isPending={updateStatusMutation.isPending}
                />
              ))}
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
              {acceptedOrders.map((order) => (
                <InProgressOrderCard
                  key={order.id}
                  order={order}
                  onFinish={() => navigate(`/pedido/${order.id}`)}
                  onViewDetails={() => navigate(`/pedido/${order.id}`)}
                  onWhatsApp={(phone) => handleWhatsAppCompany(phone, order.id)}
                />
              ))}
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
              {driverCompletedOrders.map((order) => (
                <div key={order.id} className="card-static p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold">Pedido {formatOrderCode(order.id)}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <span className="font-medium text-foreground">R$ {order.total_value.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aguardando a empresa confirmar o recebimento.
                  </p>
                </div>
              ))}
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/entregador/concluidos')}>
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
                      <span className="font-mono font-semibold">Pedido {formatOrderCode(order.id)}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">R$ {order.total_value.toFixed(2)}</span>
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

// Order Card Component
const OrderCard = ({ 
  order, 
  onAccept, 
  onViewDetails, 
  hasCredits,
  isPending 
}: { 
  order: any; 
  onAccept: () => void; 
  onViewDetails: () => void;
  hasCredits: boolean;
  isPending: boolean;
}) => {
  const { data: companyProfile } = useCompanyProfile(order.company_user_id);
  const { data: profile } = useProfile(order.company_user_id);

  return (
    <div className="card-static p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">
            {companyProfile?.company_name || profile?.name || 'Empresa'}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatBrasiliaDateShort(new Date(order.created_at))}
        </span>
      </div>
      
      {companyProfile?.address_default && (
        <p className="text-sm text-muted-foreground mb-3">
          📍 {companyProfile.address_default}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        <span className="px-2 py-1 bg-secondary rounded text-muted-foreground">
          {order.order_deliveries?.length || 0} entrega{(order.order_deliveries?.length || 0) > 1 ? 's' : ''}
        </span>
        {order.order_deliveries?.slice(0, 3).map((d: any) => (
          <span key={d.id} className="px-2 py-1 bg-secondary rounded text-muted-foreground">
            {PACKAGE_TYPE_LABELS[d.package_type as keyof typeof PACKAGE_TYPE_LABELS]}
          </span>
        ))}
        <span className="font-semibold text-foreground ml-auto">
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

// In Progress Order Card
const InProgressOrderCard = ({ 
  order, 
  onFinish, 
  onViewDetails,
  onWhatsApp 
}: { 
  order: any; 
  onFinish: () => void; 
  onViewDetails: () => void;
  onWhatsApp: (phone: string) => void;
}) => {
  const { data: companyProfile } = useCompanyProfile(order.company_user_id);
  const { data: profile } = useProfile(order.company_user_id);

  return (
    <div className="card-static p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold">Pedido {formatOrderCode(order.id)}</span>
          <StatusBadge status={order.status} size="sm" />
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-secondary/50">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{companyProfile?.company_name || profile?.name}</p>
          {companyProfile?.address_default && (
            <p className="text-xs text-muted-foreground">{companyProfile.address_default}</p>
          )}
        </div>
        {profile?.phone && (
          <Button
            size="sm"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
            onClick={() => onWhatsApp(profile.phone!)}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span>{order.order_deliveries?.length || 0} entrega{(order.order_deliveries?.length || 0) > 1 ? 's' : ''}</span>
        <span className="font-medium text-foreground">R$ {order.total_value.toFixed(2)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onFinish}>
          <CheckCircle2 className="h-4 w-4" />
          Finalizar Pedido
        </Button>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export default EntregadorDashboard;
