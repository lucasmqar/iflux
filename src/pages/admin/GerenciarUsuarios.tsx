import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockUsers, hasValidCredits, getUserCredits } from '@/data/mockData';
import { formatBrasiliaDateShort } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Search,
  User,
  Building2,
  Truck,
  Ban,
  Trash2,
  CreditCard,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const roleConfig = {
  admin: { label: 'Admin', icon: User, className: 'bg-purple-100 text-purple-800' },
  company: { label: 'Empresa', icon: Building2, className: 'bg-blue-100 text-blue-800' },
  driver: { label: 'Entregador', icon: Truck, className: 'bg-emerald-100 text-emerald-800' },
};

const GerenciarUsuarios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  if (!user || user.role !== 'admin') return null;

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = (userId: string) => {
    toast.success('Usuário banido');
  };

  const handleDelete = (userId: string) => {
    toast.success('Usuário excluído');
  };

  const handleAddCredits = (userId: string) => {
    toast.success('Crédito adicionado');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">{mockUsers.length} usuários</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users list */}
        <div className="space-y-3">
          {filteredUsers.map((u, index) => {
            const config = roleConfig[u.role];
            const RoleIcon = config.icon;
            const isActive = hasValidCredits(u);
            const credits = getUserCredits(u.id);

            return (
              <div
                key={u.id}
                className="card-static p-4 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <RoleIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">{u.name}</p>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', config.className)}>
                        {config.label}
                      </span>
                      {u.isBanned && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
                          Banido
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-sm text-muted-foreground">{u.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {isActive ? (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Ativo até {credits ? formatBrasiliaDateShort(credits.validUntil) : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Expirado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleAddCredits(u.id)} title="Adicionar crédito">
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleBan(u.id)} title="Banir">
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(u.id)} title="Excluir" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default GerenciarUsuarios;
