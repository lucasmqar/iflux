import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  MapPin, 
  Package, 
  FileText,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

const NovaEntrega = () => {
  const { user, hasCredits } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    itemDescription: '',
    notes: '',
  });

  if (!user || user.role !== 'empresa') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasCredits) {
      toast.error('Você precisa de créditos para solicitar entregas');
      navigate('/creditos');
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Entrega solicitada com sucesso!', {
      description: 'Aguarde um entregador aceitar sua solicitação',
    });

    navigate('/minhas-entregas');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isValid = formData.pickupAddress && formData.deliveryAddress && formData.itemDescription;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Entrega</h1>
            <p className="text-muted-foreground">Preencha os dados da entrega</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup address */}
          <div className="card-static p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <MapPin className="h-5 w-5 text-amber-800" />
              </div>
              <h2 className="font-semibold text-foreground">Endereço de Coleta</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Endereço completo *</Label>
              <Input
                id="pickupAddress"
                name="pickupAddress"
                placeholder="Rua, número, bairro, cidade..."
                value={formData.pickupAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Delivery address */}
          <div className="card-static p-6 space-y-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <MapPin className="h-5 w-5 text-emerald-800" />
              </div>
              <h2 className="font-semibold text-foreground">Endereço de Entrega</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Endereço completo *</Label>
              <Input
                id="deliveryAddress"
                name="deliveryAddress"
                placeholder="Rua, número, bairro, cidade..."
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Item description */}
          <div className="card-static p-6 space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-800" />
              </div>
              <h2 className="font-semibold text-foreground">Detalhes do Item</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemDescription">Descrição do item *</Label>
                <Input
                  id="itemDescription"
                  name="itemDescription"
                  placeholder="Ex: Caixa pequena, envelope, pacote..."
                  value={formData.itemDescription}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Instruções especiais, horários, etc..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="card-static p-4 bg-secondary/30 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>
                  O crédito só será consumido quando a entrega for concluída.
                  Você pode cancelar enquanto a entrega estiver com status "Aberta".
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="xl"
            className="w-full animate-fade-in"
            style={{ animationDelay: '200ms' }}
            disabled={loading || !isValid || !hasCredits}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Solicitando...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Solicitar Entrega
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default NovaEntrega;
