import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { TipCard } from '@/components/TipCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Clock,
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
  const [customDays, setCustomDays] = useState<Record<string, number>>({});
  
  const { data: users, isLoading, refetch, isRefetching } = useUsers();
  const addCreditsMutation = useAddCredits();

  if (!user || user.role !== 'admin') return null;

  const filteredUsers = users?.filter(u => 
    u.role !== 'admin' && (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  ) || [];

  const handleAddCredit = async (userId: string, existingCredits: { validUntil: Date } | null, days: number = 1) => {
    try {
      let newValidUntil: Date;
      const hoursToAdd = days * 24;
      
      if (existingCredits && new Date(existingCredits.validUntil) > new Date()) {
        // Add hours to existing credits
        newValidUntil = new Date(existingCredits.validUntil);
        newValidUntil.setHours(newValidUntil.getHours() + hoursToAdd);
      } else {
        // Start from now + hours
        newValidUntil = new Date();
        newValidUntil.setHours(newValidUntil.getHours() + hoursToAdd);
      }
      
      await addCreditsMutation.mutateAsync({ userId, validUntil: newValidUntil });
      toast.success(`${days} ${days === 1 ? 'dia' : 'dias'} de crédito adicionado`);
      setCustomDays(prev => ({ ...prev, [userId]: 1 }));
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

  const getDaysValue = (userId: string) => customDays[userId] || 1;

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
              <p className="text-muted-foreground">Adicionar créditos personalizados aos usuários</p>
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

        <TipCard tipKey="admin-credits" title="Como funciona">
          <p>1 crédito = 1 dia de acesso. Digite a quantidade de dias desejada e clique em adicionar. Os créditos são acumulativos.</p>
        </TipCard>

        {/* Info */}
        <div className="card-static p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Controle de créditos:</strong> Digite quantos dias deseja adicionar. 
            Se o usuário já tiver créditos válidos, os dias são somados. Se estiver expirado, conta a partir de agora.
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
            const daysValue = getDaysValue(u.id);

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
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={daysValue}
                        onChange={(e) => setCustomDays(prev => ({ 
                          ...prev, 
                          [u.id]: Math.max(1, Math.min(365, parseInt(e.target.value) || 1)) 
                        }))}
                        className="w-16 h-9 text-center"
                      />
                      <span className="text-xs text-muted-foreground">dias</span>
                    </div>
                    <Button 
                      onClick={() => handleAddCredit(u.id, u.credits, daysValue)}
                      disabled={addCreditsMutation.isPending}
                      size="sm"
                    >
                      {addCreditsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Adicionar
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

export default GerenciarCreditos;
