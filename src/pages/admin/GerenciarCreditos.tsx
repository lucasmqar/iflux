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
  Plus,
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

const GerenciarCreditos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  if (!user || user.role !== 'admin') return null;

  const filteredUsers = mockUsers.filter(u => 
    u.role !== 'admin' && (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleAddCredit = (userId: string) => {
    toast.success('Crédito adicionado (24h)');
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
            <h1 className="text-2xl font-semibold text-foreground">Gerenciar Créditos</h1>
            <p className="text-muted-foreground">Adicionar créditos aos usuários</p>
          </div>
        </div>

        {/* Info */}
        <div className="card-static p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Regra de créditos:</strong> Ao adicionar 1 crédito, o usuário ganha +24h de acesso. 
            Se já tiver créditos válidos, as horas são somadas. Se estiver expirado, conta a partir de agora.
          </p>
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
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <RoleIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">{u.name}</p>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', config.className)}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                  <Button onClick={() => handleAddCredit(u.id)}>
                    <Plus className="h-4 w-4" />
                    +24h
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default GerenciarCreditos;
