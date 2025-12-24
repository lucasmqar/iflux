import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { getDelivererDeliveries, getAvailableDeliveries } from '@/data/mockData';
import { ExpiredCreditBanner, PromoBanner } from '@/components/banners';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EntregadorDashboard = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'entregador') return null;

  const myDeliveries = getDelivererDeliveries(user.id);
  const availableDeliveries = getAvailableDeliveries();
  
  const stats = {
    available: availableDeliveries.length,
    inProgress: myDeliveries.filter(d => ['ACEITA', 'COLETADA'].includes(d.status)).length,
    completed: myDeliveries.filter(d => d.status === 'CONCLUIDA').length,
  };

  // Estimated earnings (mock calculation)
  const estimatedEarnings = stats.completed * 15; // R$15 per delivery

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Expired credit banner */}
        <ExpiredCreditBanner />

        {/* Promo banner (only show when has credits) */}
        {hasCredits && <PromoBanner variant="compact" />}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Olá, {user.name}!</p>
          </div>
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
            title="Concluídas"
            value={stats.completed}
            icon={CheckCircle2}
            iconClassName="bg-emerald-100"
            delay={100}
          />
          <StatsCard
            title="Ganhos Estimados"
            value={`R$ ${estimatedEarnings}`}
            icon={DollarSign}
            iconClassName="bg-purple-100"
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
            onClick={() => navigate('/disponiveis')}
            disabled={!hasCredits}
            className="card-elevated p-6 text-left group disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-in"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors">
                <Clock className="h-6 w-6 text-amber-800" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-amber-800 transition-colors">
                  Entregas Disponíveis
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.available} entregas aguardando
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
                  Acompanhe suas entregas ativas
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default EntregadorDashboard;
