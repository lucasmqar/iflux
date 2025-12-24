import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mockUsers, mockAdminAlerts } from '@/data/mockData';
import { formatBrasiliaDateShort } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  AlertTriangle,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GerenciarAlertas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');

  if (!user || user.role !== 'admin') return null;

  const handleCreateAlert = () => {
    if (!selectedUser || !message.trim()) {
      toast.error('Selecione um usuário e escreva uma mensagem');
      return;
    }
    toast.success('Alerta criado');
    setSelectedUser('');
    setMessage('');
  };

  const handleDelete = (alertId: string) => {
    toast.success('Alerta removido');
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
            <h1 className="text-2xl font-semibold text-foreground">Gerenciar Alertas</h1>
            <p className="text-muted-foreground">Criar alertas para usuários</p>
          </div>
        </div>

        {/* Create alert */}
        <div className="card-static p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Criar Novo Alerta
          </h2>
          
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.filter(u => u.role !== 'admin').map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Digite a mensagem do alerta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleCreateAlert}>
            <Plus className="h-4 w-4" />
            Criar Alerta
          </Button>
        </div>

        {/* Info */}
        <div className="card-static p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            Alertas aparecem em destaque amarelo no topo do dashboard do usuário.
          </p>
        </div>

        {/* Existing alerts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Alertas Ativos</h2>
          
          {mockAdminAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum alerta ativo</p>
            </div>
          ) : (
            mockAdminAlerts.map((alert) => {
              const targetUser = mockUsers.find(u => u.id === alert.targetUserId);
              return (
                <div key={alert.id} className="card-static p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-800">{targetUser?.name}</p>
                      <p className="text-sm text-amber-700 mt-1">{alert.message}</p>
                      <p className="text-xs text-amber-600 mt-2">
                        {formatBrasiliaDateShort(alert.createdAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(alert.id)}>
                      <Trash2 className="h-4 w-4 text-amber-700" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default GerenciarAlertas;
