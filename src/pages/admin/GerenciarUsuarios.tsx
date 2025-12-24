import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockUsers, hasValidCredits } from '@/data/mockData';
import { User } from '@/types';
import { 
  Search, 
  Eye, 
  Edit, 
  Ban, 
  CheckCircle,
  Building2,
  Truck,
  Shield,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-800' },
  empresa: { label: 'Empresa', icon: Building2, color: 'bg-blue-100 text-blue-800' },
  entregador: { label: 'Entregador', icon: Truck, color: 'bg-emerald-100 text-emerald-800' },
};

const GerenciarUsuarios = () => {
  const [search, setSearch] = useState('');
  const [users] = useState<User[]>(mockUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">{users.length} usuários cadastrados</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Users list */}
        <div className="space-y-3">
          {filteredUsers.map((user, index) => {
            const config = roleConfig[user.role];
            const RoleIcon = config.icon;
            const isActive = hasValidCredits(user);

            return (
              <div
                key={user.id}
                className="card-static p-4 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <RoleIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.color)}>
                      {config.label}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-red-500')} />
                      {isActive ? 'Ativo' : 'Expirado'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      <CreditCard className="h-3 w-3" />
                      {user.credits}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={user.isBanned ? 'text-emerald-600' : 'text-destructive'}
                    >
                      {user.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default GerenciarUsuarios;
