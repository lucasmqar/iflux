import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers, useAddCredits } from '@/hooks/useUsers';
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
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const roleConfig = {
  admin: { label: 'Admin', icon: User, className: 'bg-purple-100 text-purple-800' },
  company: { label: 'Empresa', icon: Building2, className: 'bg-blue-100 text-blue-800' },
  driver: { label: 'Entregador', icon: Truck, className: 'bg-emerald-100 text-emerald-800' },
};

const GerenciarCreditos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: users, isLoading, refetch, isRefetching } = useUsers();
  const addCreditsMutation = useAddCredits();

  if (!user || user.role !== 'admin') return null;

  const filteredUsers = users?.filter(u => 
    u.role !== 'admin' && (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  ) || [];

  const handleAddCredit = async (userId: string, existingCredits: { validUntil: Date } | null) => {
    try {
      let newValidUntil: Date;
      
      if (existingCredits && new Date(existingCredits.validUntil) > new Date()) {
        // Add 24 hours to existing credits
        newValidUntil = new Date(existingCredits.validUntil);
        newValidUntil.setHours(newValidUntil.getHours() + 24);
      } else {
        // Start from now + 24 hours
        newValidUntil = new Date();
        newValidUntil.setHours(newValidUntil.getHours() + 24);
      }
      
      await addCreditsMutation.mutateAsync({ userId, validUntil: newValidUntil });
      toast.success('Crédito de +24h adicionado');
    } catch (error) {
      toast.error('Erro ao adicionar crédito');
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const hasValidCredits = (userCredits: { validUntil: Date } | null) => {
    if (!userCredits) return false;
    return new Date(userCredits.validUntil) > new Date();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Gerenciar Créditos</h1>
              <p className="text-muted-foreground">Adicionar créditos aos usuários</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
            Atualizar
          </Button>
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

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? 'Nenhum usuário encontrado' : 'Nenhum usuário para gerenciar créditos'}
            </p>
          </div>
        )}

        {/* Users list */}
        <div className="space-y-3">
          {filteredUsers.map((u, index) => {
            const config = u.role ? roleConfig[u.role] : { label: 'Sem role', icon: User, className: 'bg-gray-100 text-gray-800' };
            const RoleIcon = config.icon;
            const isActive = hasValidCredits(u.credits);

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
                          Ativo até {u.credits ? formatDate(u.credits.validUntil) : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          {u.credits ? 'Expirado' : 'Sem créditos'}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAddCredit(u.id, u.credits)}
                    disabled={addCreditsMutation.isPending}
                  >
                    {addCreditsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
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
