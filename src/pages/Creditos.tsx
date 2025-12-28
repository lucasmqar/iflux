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
      <div className="max-w-2xl mx-auto space-y-6 overflow-x-hidden">
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
          <CreditsBadge size="lg" />
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

        {/* Support and Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-static p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Suporte</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Dúvidas sobre créditos? Fale com nosso suporte.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddCredits}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
          <div className="card-static p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-foreground">Dica</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Os créditos são consumidos apenas quando você tem pedidos ativos. 
              Sem pedidos, seu crédito fica pausado.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Creditos;
