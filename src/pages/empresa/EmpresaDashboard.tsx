import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { getCompanyDeliveries } from '@/data/mockData';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Plus,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmpresaDashboard = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'empresa') return null;

  const deliveries = getCompanyDeliveries(user.id);
  
  const stats = {
    open: deliveries.filter(d => d.status === 'ABERTA').length,
    inProgress: deliveries.filter(d => ['ACEITA', 'COLETADA'].includes(d.status)).length,
    completed: deliveries.filter(d => d.status === 'CONCLUIDA').length,
    cancelled: deliveries.filter(d => d.status === 'CANCELADA').length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Olá, {user.name}!</p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/nova-entrega')}
            disabled={!hasCredits}
          >
            <Plus className="h-5 w-5" />
            Nova Entrega
          </Button>
        </div>

        {/* Credits warning */}
        {!hasCredits && (
          <div className="card-static p-4 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Seus créditos expiraram</p>
                <p className="text-sm text-muted-foreground">
                  Adicione créditos para continuar usando o sistema
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => navigate('/creditos')}>
                Adicionar Créditos
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Abertas"
            value={stats.open}
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
            title="Concluídas"
            value={stats.completed}
            icon={CheckCircle2}
            iconClassName="bg-emerald-100"
            delay={100}
          />
          <StatsCard
            title="Canceladas"
            value={stats.cancelled}
            icon={XCircle}
            iconClassName="bg-red-100"
            delay={150}
          />
        </div>

        {/* Credits card */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary">
                <CreditCard className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créditos disponíveis</p>
                <p className="text-2xl font-bold text-foreground">{user.credits}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/creditos')}>
              Ver detalhes
            </Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/nova-entrega')}
            disabled={!hasCredits}
            className="card-elevated p-6 text-left group disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-in"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Plus className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  Solicitar Entrega
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie uma nova solicitação de entrega
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/minhas-entregas')}
            className="card-elevated p-6 text-left group opacity-0 animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Minhas Entregas
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Acompanhe suas entregas em tempo real
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmpresaDashboard;
