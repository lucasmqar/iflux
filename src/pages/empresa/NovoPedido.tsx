import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCompanyProfile } from '@/hooks/useCompanyProfiles';
import { useCreateOrder } from '@/hooks/useOrders';
import { PACKAGE_TYPE_LABELS, PackageType } from '@/types';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Package,
  MapPin,
  FileText,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

interface DeliveryItem {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageType: PackageType;
  suggestedPrice: number;
  notes: string;
}

const packageTypes: PackageType[] = ['envelope', 'bag', 'small_box', 'large_box', 'other'];

const NovoPedido = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<string[]>(['1']);

  // Fetch company profile for default address
  const { data: companyProfile } = useCompanyProfile(user?.id);
  const createOrderMutation = useCreateOrder();

  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([
    {
      id: '1',
      pickupAddress: '',
      dropoffAddress: '',
      packageType: 'bag',
      suggestedPrice: 9,
      notes: '',
    },
  ]);

  // Set default pickup address when company profile loads
  useState(() => {
    if (companyProfile?.address_default && deliveries[0].pickupAddress === '') {
      setDeliveries(prev => prev.map((d, i) => 
        i === 0 ? { ...d, pickupAddress: companyProfile.address_default || '' } : d
      ));
    }
  });

  if (!user || user.role !== 'company') return null;

  const addDelivery = () => {
    const newId = String(deliveries.length + 1);
    setDeliveries([
      ...deliveries,
      {
        id: newId,
        pickupAddress: companyProfile?.address_default || '',
        dropoffAddress: '',
        packageType: 'bag',
        suggestedPrice: 9,
        notes: '',
      },
    ]);
    setOpenItems([...openItems, newId]);
  };

  const removeDelivery = (id: string) => {
    if (deliveries.length === 1) {
      toast.error('O pedido precisa ter pelo menos 1 entrega');
      return;
    }
    setDeliveries(deliveries.filter(d => d.id !== id));
    setOpenItems(openItems.filter(i => i !== id));
  };

  const updateDelivery = (id: string, field: keyof DeliveryItem, value: string | number) => {
    setDeliveries(deliveries.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const adjustPrice = (id: string, delta: number) => {
    setDeliveries(deliveries.map(d => {
      if (d.id === id) {
        const newPrice = Math.max(3, d.suggestedPrice + delta);
        return { ...d, suggestedPrice: newPrice };
      }
      return d;
    }));
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Auto-fill pickup address with company default
  const fillDefaultAddress = (id: string) => {
    if (companyProfile?.address_default) {
      updateDelivery(id, 'pickupAddress', companyProfile.address_default);
    }
  };

  const totalValue = deliveries.reduce((sum, d) => sum + d.suggestedPrice, 0);

  const isValid = deliveries.every(d => d.pickupAddress && d.dropoffAddress);

  const handleSubmit = async () => {
    if (!hasCredits) {
      toast.error('Você precisa de créditos para criar pedidos');
      navigate('/creditos');
      return;
    }

    if (!isValid) {
      toast.error('Preencha todos os endereços');
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        order: {
          company_user_id: user.id,
          total_value: totalValue,
          status: 'pending',
        },
        deliveries: deliveries.map(d => ({
          pickup_address: d.pickupAddress,
          dropoff_address: d.dropoffAddress,
          package_type: d.packageType,
          notes: d.notes || null,
          suggested_price: d.suggestedPrice,
        })),
      });
      
      toast.success('Pedido criado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar pedido');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Novo Pedido</h1>
            <p className="text-muted-foreground">Adicione as entregas do pedido</p>
          </div>
        </div>

        {/* Company default address info */}
        {companyProfile?.address_default && (
          <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
            <MapPin className="h-4 w-4 inline mr-2" />
            Endereço padrão: <strong>{companyProfile.address_default}</strong>
          </div>
        )}

        {/* Deliveries */}
        <div className="space-y-3">
          {deliveries.map((delivery, index) => (
            <Collapsible 
              key={delivery.id}
              open={openItems.includes(delivery.id)}
              onOpenChange={() => toggleItem(delivery.id)}
            >
              <div className="card-static overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Entrega {index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        {PACKAGE_TYPE_LABELS[delivery.packageType]} • R$ {delivery.suggestedPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {deliveries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDelivery(delivery.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {openItems.includes(delivery.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    {/* Pickup */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-amber-600" />
                          Endereço de Retirada
                        </Label>
                        {companyProfile?.address_default && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fillDefaultAddress(delivery.id)}
                            className="text-xs"
                          >
                            Usar padrão
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Endereço completo de retirada"
                        value={delivery.pickupAddress}
                        onChange={(e) => updateDelivery(delivery.id, 'pickupAddress', e.target.value)}
                      />
                    </div>

                    {/* Dropoff */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Endereço de Entrega
                      </Label>
                      <Input
                        placeholder="Endereço completo de entrega"
                        value={delivery.dropoffAddress}
                        onChange={(e) => updateDelivery(delivery.id, 'dropoffAddress', e.target.value)}
                      />
                    </div>

                    {/* Package type */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Tipo de Pacote
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {packageTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateDelivery(delivery.id, 'packageType', type)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                              delivery.packageType === type
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            )}
                          >
                            {PACKAGE_TYPE_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label>Valor Sugerido</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => adjustPrice(delivery.id, -3)}
                          disabled={delivery.suggestedPrice <= 3}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-semibold text-foreground w-24 text-center">
                          R$ {delivery.suggestedPrice.toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => adjustPrice(delivery.id, 3)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[3, 6, 9, 12, 15].map((price) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => updateDelivery(delivery.id, 'suggestedPrice', price)}
                            className={cn(
                              'px-3 py-1 rounded text-sm font-medium transition-colors',
                              delivery.suggestedPrice === price
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            )}
                          >
                            R${price}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Observações (opcional)
                      </Label>
                      <Textarea
                        placeholder="Instruções especiais, horários, etc..."
                        value={delivery.notes}
                        onChange={(e) => updateDelivery(delivery.id, 'notes', e.target.value)}
                        rows={2}
                        maxLength={120}
                      />
                      <p className="text-xs text-muted-foreground">{delivery.notes.length}/120</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        {/* Add delivery */}
        <Button variant="outline" className="w-full" onClick={addDelivery}>
          <Plus className="h-4 w-4" />
          Adicionar Entrega
        </Button>

        {/* Summary */}
        <div className="card-static p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{deliveries.length} entrega{deliveries.length > 1 ? 's' : ''}</p>
              <p className="text-2xl font-semibold text-foreground">R$ {totalValue.toFixed(2)}</p>
            </div>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending || !isValid || !hasCredits}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Concluir Pedido
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovoPedido;
