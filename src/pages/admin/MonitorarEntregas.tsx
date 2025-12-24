import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockDeliveries } from '@/data/mockData';
import { Delivery, DeliveryStatus } from '@/types';
import { 
  Search, 
  Eye, 
  XCircle,
  MapPin,
  Clock,
  User,
  Building2,
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

const MonitorarEntregas = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [deliveries] = useState<Delivery[]>(mockDeliveries);

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.code.toLowerCase().includes(search.toLowerCase()) ||
      delivery.companyName.toLowerCase().includes(search.toLowerCase()) ||
      delivery.deliveryPersonName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitorar Entregas</h1>
          <p className="text-muted-foreground">{deliveries.length} entregas no sistema</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
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
        </div>

        {/* Deliveries list */}
        <div className="space-y-3">
          {filteredDeliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="card-static p-4 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Code and status */}
                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold text-foreground">{delivery.code}</div>
                  <StatusBadge status={delivery.status} size="sm" />
                </div>

                {/* Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{delivery.companyName}</span>
                  </div>
                  {delivery.deliveryPersonName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{delivery.deliveryPersonName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{delivery.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{formatDate(delivery.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  {delivery.status !== 'CONCLUIDA' && delivery.status !== 'CANCELADA' && (
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma entrega encontrada
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MonitorarEntregas;
