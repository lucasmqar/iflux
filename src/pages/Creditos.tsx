import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { CreditsBadge } from '@/components/CreditsBadge';
import { Button } from '@/components/ui/button';
import { getAddCreditsWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import { MessageCircle, ArrowLeft, Clock, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Creditos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleAddCredits = () => {
    openWhatsApp(getAddCreditsWhatsAppUrl(user));
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Créditos</h1>
            <p className="text-muted-foreground">Gerencie seu acesso ao FLUX</p>
          </div>
        </div>

        {/* Current status */}
        <div className="card-static p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Atual</h3>
          <CreditsBadge user={user} size="lg" />
        </div>

        {/* How it works */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-800" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Como funciona?</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Cada crédito libera <strong className="text-foreground">24 horas</strong> de uso contínuo</p>
            <p>• O crédito só é consumido quando você tem um pedido em andamento</p>
            <p>• Sem créditos ativos, o acesso fica pausado (exceto esta tela e seu perfil)</p>
          </div>
        </div>

        {/* Add credits */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Gift className="h-5 w-5 text-emerald-800" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Adicionar Créditos</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Entre em contato via WhatsApp para adicionar créditos à sua conta.
          </p>
          <Button
            size="lg"
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
            onClick={handleAddCredits}
          >
            <MessageCircle className="h-5 w-5" />
            Comprar Créditos via WhatsApp
          </Button>
        </div>

        {/* Promo packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-static p-5 bg-gradient-to-br from-neutral-900 to-neutral-800">
            <h3 className="text-lg font-semibold text-white mb-2">Pacote 3 meses</h3>
            <p className="text-neutral-300 text-sm mb-4">Economize com o plano trimestral</p>
            <Button
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
              onClick={handleAddCredits}
            >
              <MessageCircle className="h-4 w-4" />
              Contratar
            </Button>
          </div>
          <div className="card-static p-5 bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-amber-500">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">Pacote 6 meses</h3>
              <span className="text-xs bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-medium">Melhor</span>
            </div>
            <p className="text-neutral-300 text-sm mb-4">Máxima economia</p>
            <Button
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
              onClick={handleAddCredits}
            >
              <MessageCircle className="h-4 w-4" />
              Contratar
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Creditos;
