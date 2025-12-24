import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { CreditsBadge } from '@/components/CreditsBadge';
import { Button } from '@/components/ui/button';
import { WHATSAPP_SUPPORT } from '@/types';
import { User, Building2, Truck, MessageCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleConfig = {
  admin: {
    label: 'Administrador',
    icon: User,
    description: 'Acesso completo ao sistema',
    color: 'bg-purple-100 text-purple-800',
  },
  empresa: {
    label: 'Empresa',
    icon: Building2,
    description: 'Solicite e gerencie suas entregas',
    color: 'bg-blue-100 text-blue-800',
  },
  entregador: {
    label: 'Entregador',
    icon: Truck,
    description: 'Realize entregas e acompanhe seus ganhos',
    color: 'bg-emerald-100 text-emerald-800',
  },
};

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const config = roleConfig[user.role];
  const RoleIcon = config.icon;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>

        {/* User card */}
        <div className="card-static p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  <RoleIcon className="h-3.5 w-3.5" />
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Credits status */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Status de Créditos</h3>
          <CreditsBadge user={user} size="lg" />

          <div className="mt-6">
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full"
              onClick={() => window.open(WHATSAPP_SUPPORT, '_blank')}
            >
              <MessageCircle className="h-5 w-5" />
              Adicionar Créditos via WhatsApp
            </Button>
          </div>
        </div>

        {/* Account info */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Informações da Conta</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium text-foreground">{user.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">E-mail</span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Telefone</span>
                <span className="font-medium text-foreground">{user.phone}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Membro desde</span>
              <span className="font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </Button>
      </div>
    </AppLayout>
  );
};

export default Perfil;
