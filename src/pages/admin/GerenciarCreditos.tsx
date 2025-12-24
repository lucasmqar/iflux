import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockUsers, hasValidCredits } from '@/data/mockData';
import { User } from '@/types';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  CreditCard,
  Building2,
  Truck,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-800' },
  empresa: { label: 'Empresa', icon: Building2, color: 'bg-blue-100 text-blue-800' },
  entregador: { label: 'Entregador', icon: Truck, color: 'bg-emerald-100 text-emerald-800' },
};

const GerenciarCreditos = () => {
  const [search, setSearch] = useState('');
  const [users] = useState<User[]>(mockUsers.filter(u => u.role !== 'admin'));
  const [addingCredit, setAddingCredit] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCredit = async (userId: string, userName: string) => {
    setAddingCredit(userId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success(`1 crédito adicionado para ${userName}`, {
      description: '+24 horas de acesso',
    });
    
    setAddingCredit(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Créditos</h1>
          <p className="text-muted-foreground">Adicione créditos aos usuários</p>
        </div>

        {/* Info card */}
        <div className="card-static p-4 bg-secondary/30">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-accent mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Regra de créditos</p>
              <p className="text-muted-foreground">
                Cada crédito adiciona 24 horas à validade. Se expirado, a validade começa a partir de agora.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário..."
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

                  {/* Credits info */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Créditos: </span>
                      <span className="font-medium text-foreground">{user.credits}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Válido até: </span>
                      <span className={cn('font-medium', isActive ? 'text-foreground' : 'text-destructive')}>
                        {formatDate(user.validUntil)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-red-500')} />
                      {isActive ? 'Ativo' : 'Expirado'}
                    </span>
                  </div>

                  {/* Add credit button */}
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleAddCredit(user.id, user.name)}
                    disabled={addingCredit === user.id}
                  >
                    {addingCredit === user.id ? (
                      <>
                        <CheckCircle className="h-4 w-4 animate-pulse" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        +1 Crédito (24h)
                      </>
                    )}
                  </Button>
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

export default GerenciarCreditos;
