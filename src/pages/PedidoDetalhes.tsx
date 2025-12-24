import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { mockOrders, getUserById, getDriverProfile, getCompanyProfile } from '@/data/mockData';
import { getDriverWhatsAppUrl, getCompanyWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { formatBrasiliaDateShort, PACKAGE_TYPE_LABELS } from '@/types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MessageCircle,
  Building2,
  User,
  Package,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const PedidoDetalhes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [openDeliveries, setOpenDeliveries] = useState<string[]>(['0']);

  if (!user) return null;

  const order = mockOrders.find(o => o.id === id);
  
  if (!order) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Pedido não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const driver = order.driverUserId ? getUserById(order.driverUserId) : null;
  const driverProfile = order.driverUserId ? getDriverProfile(order.driverUserId) : null;
  const company = getUserById(order.companyUserId);
  const companyProfile = getCompanyProfile(order.companyUserId);

  const toggleDelivery = (index: string) => {
    setOpenDeliveries(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleWhatsAppDriver = () => {
    if (driver) {
      openWhatsApp(getDriverWhatsAppUrl(driver.phone, `#${order.id}`));
    }
  };

  const handleWhatsAppCompany = () => {
    if (company) {
      openWhatsApp(getCompanyWhatsAppUrl(company.phone, `#${order.id}`));
    }
  };

  const handleConfirmReceived = () => {
    toast.success('Pedido confirmado!');
    navigate('/dashboard');
  };

  const handleDriverComplete = () => {
    toast.success('Pedido finalizado! Aguardando confirmação da empresa.');
    navigate('/dashboard');
  };

  const handleAccept = () => {
    toast.success('Pedido aceito!');
    navigate('/dashboard');
  };

  const handleCancel = () => {
    toast.success('Pedido cancelado');
    navigate('/dashboard');
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">Pedido #{order.id}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-muted-foreground">{formatBrasiliaDateShort(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-semibold text-foreground">R$ {order.totalValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Company info (for driver) */}
        {user.role === 'driver' && (
          <div className="card-static p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{company?.name || companyProfile?.companyName}</p>
                {companyProfile && (
                  <p className="text-sm text-muted-foreground">{companyProfile.addressDefault}</p>
                )}
                <p className="text-sm text-muted-foreground">{company?.phone}</p>
              </div>
              {['accepted', 'driver_completed'].includes(order.status) && (
                <Button
                  className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
                  onClick={handleWhatsAppCompany}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Driver info (for company) */}
        {user.role === 'company' && driver && (
          <div className="card-static p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{driver.name}</p>
                {driverProfile && (
                  <p className="text-sm text-muted-foreground">
                    {driverProfile.vehicleType === 'moto' ? '🏍️' : driverProfile.vehicleType === 'car' ? '🚗' : '🚲'} {driverProfile.vehicleModel} • {driverProfile.plate}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{driver.phone}</p>
              </div>
              {['accepted', 'driver_completed'].includes(order.status) && (
                <Button
                  className="bg-[#25D366] hover:bg-[#20BD5A] text-white"
                  onClick={handleWhatsAppDriver}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Deliveries */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Entregas ({order.deliveries.length})</h2>
          
          {order.deliveries.map((delivery, index) => (
            <Collapsible 
              key={delivery.id} 
              open={openDeliveries.includes(String(index))}
              onOpenChange={() => toggleDelivery(String(index))}
            >
              <div className="card-static overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{PACKAGE_TYPE_LABELS[delivery.packageType]}</p>
                      <p className="text-sm text-muted-foreground">R$ {delivery.suggestedPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  {openDeliveries.includes(String(index)) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Retirada</p>
                        <p className="text-sm text-foreground">{delivery.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Entrega</p>
                        <p className="text-sm text-foreground">{delivery.dropoffAddress}</p>
                      </div>
                    </div>
                    {delivery.notes && (
                      <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                        <strong>Obs:</strong> {delivery.notes}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {/* Driver actions */}
          {user.role === 'driver' && order.status === 'pending' && (
            <Button size="lg" className="w-full" onClick={handleAccept}>
              <CheckCircle2 className="h-5 w-5" />
              Aceitar Pedido
            </Button>
          )}
          
          {user.role === 'driver' && order.status === 'accepted' && (
            <Button size="lg" className="w-full" onClick={handleDriverComplete}>
              <CheckCircle2 className="h-5 w-5" />
              Finalizar Pedido
            </Button>
          )}

          {/* Company actions */}
          {user.role === 'company' && order.status === 'driver_completed' && (
            <Button size="lg" className="w-full" onClick={handleConfirmReceived}>
              <CheckCircle2 className="h-5 w-5" />
              Confirmar Recebimento
            </Button>
          )}
          
          {user.role === 'company' && order.status === 'pending' && (
            <Button variant="destructive" size="lg" className="w-full" onClick={handleCancel}>
              Cancelar Pedido
            </Button>
          )}

          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PedidoDetalhes;
