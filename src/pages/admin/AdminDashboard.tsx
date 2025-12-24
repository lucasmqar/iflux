import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { getStats } from '@/data/mockData';
import { 
  Users, 
  Building2, 
  Truck, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const stats = getStats();

  if (!user || user.role !== 'admin') return null;

  const quickActions = [
    {
      label: 'Gerenciar Usuários',
      icon: Users,
      path: '/usuarios',
      description: 'Ver, editar e gerenciar usuários',
    },
    {
      label: 'Monitorar Entregas',
      icon: Package,
      path: '/entregas',
      description: 'Acompanhar todas as entregas',
    },
    {
      label: 'Gerenciar Créditos',
      icon: CreditCard,
      path: '/gerenciar-creditos',
      description: 'Adicionar créditos aos usuários',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground">Visão geral do sistema FLUX</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Atualizado agora</span>
          </div>
        </div>

        {/* User Stats */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Usuários</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total de Usuários"
              value={stats.totalUsers}
              icon={Users}
              delay={0}
            />
            <StatsCard
              title="Empresas"
              value={stats.totalCompanies}
              icon={Building2}
              delay={50}
            />
            <StatsCard
              title="Entregadores"
              value={stats.totalDeliverers}
              icon={Truck}
              delay={100}
            />
            <StatsCard
              title="Ativos Agora"
              value={stats.activeUsers}
              icon={UserCheck}
              iconClassName="bg-emerald-100"
              delay={150}
            />
          </div>
        </div>

        {/* Delivery Stats */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Entregas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total de Entregas"
              value={stats.totalDeliveries}
              icon={Package}
              delay={200}
            />
            <StatsCard
              title="Abertas"
              value={stats.openDeliveries}
              icon={Clock}
              iconClassName="bg-amber-100"
              delay={250}
            />
            <StatsCard
              title="Concluídas"
              value={stats.completedDeliveries}
              icon={CheckCircle2}
              iconClassName="bg-emerald-100"
              delay={300}
            />
            <StatsCard
              title="Canceladas"
              value={stats.cancelledDeliveries}
              icon={XCircle}
              iconClassName="bg-red-100"
              delay={350}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="card-elevated p-6 text-left group opacity-0 animate-fade-in"
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
