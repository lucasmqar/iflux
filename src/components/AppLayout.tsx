import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import fluxLogo from '@/assets/flux-logo.png';
import {
  LayoutDashboard,
  Package,
  Users,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Truck,
  History,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { WHATSAPP_SUPPORT } from '@/types';
import { hasValidCredits } from '@/data/mockData';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, hasCredits } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const roleLabels = {
    admin: 'Administrador',
    empresa: 'Empresa',
    entregador: 'Entregador',
  };

  // Define navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ];

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { label: 'Usuários', icon: Users, path: '/usuarios' },
        { label: 'Entregas', icon: Package, path: '/entregas' },
        { label: 'Créditos', icon: CreditCard, path: '/gerenciar-creditos' },
      ];
    }

    if (user.role === 'empresa') {
      return [
        ...baseItems,
        { label: 'Nova Entrega', icon: Plus, path: '/nova-entrega' },
        { label: 'Minhas Entregas', icon: Package, path: '/minhas-entregas' },
      ];
    }

    if (user.role === 'entregador') {
      return [
        ...baseItems,
        { label: 'Disponíveis', icon: Truck, path: '/disponiveis' },
        { label: 'Minhas Entregas', icon: Package, path: '/minhas-entregas' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  // Always accessible items
  const bottomItems = [
    { label: 'Perfil', icon: User, path: '/perfil' },
    { label: 'Créditos', icon: CreditCard, path: '/creditos' },
  ];

  const isItemDisabled = (path: string) => {
    if (!hasCredits && !['/perfil', '/creditos'].includes(path)) {
      return true;
    }
    return false;
  };

  const handleNavClick = (path: string) => {
    if (isItemDisabled(path)) {
      navigate('/creditos');
      return;
    }
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={fluxLogo} alt="FLUX" className="w-10 h-10 object-contain" />
              <span className="font-brand text-xl text-foreground">FLUX</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-border">
          <p className="font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
          <div className="mt-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full',
                hasCredits
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  hasCredits ? 'bg-emerald-500' : 'bg-red-500'
                )}
              />
              {hasCredits ? 'Ativo' : 'Expirado'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const disabled = isItemDisabled(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  disabled && 'opacity-50'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {disabled && (
                  <span className="ml-auto text-xs">🔒</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="p-3 border-t border-border space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}

          {/* WhatsApp support */}
          <a
            href={WHATSAPP_SUPPORT}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Suporte
          </a>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={fluxLogo} alt="FLUX" className="w-8 h-8 object-contain" />
              <span className="font-brand text-lg">FLUX</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
