import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { CreditsBadge } from '@/components/CreditsBadge';
import { Button } from '@/components/ui/button';
import { WHATSAPP_SUPPORT } from '@/types';
import { mockCreditHistory } from '@/data/mockData';
import { MessageCircle, CreditCard, Clock, Plus, Info } from 'lucide-react';

const Creditos = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Filter credit history for current user
  const userHistory = mockCreditHistory.filter(h => h.userId === user.id);

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
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Créditos</h1>

        {/* Current status */}
        <div className="card-static p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-secondary">
              <CreditCard className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-3">Status Atual</h2>
              <CreditsBadge user={user} size="lg" />
            </div>
          </div>
        </div>

        {/* How credits work */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Como funcionam os créditos?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  Cada crédito libera <strong className="text-foreground">24 horas</strong> de acesso contínuo ao sistema
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  Créditos são acumulativos - adicionar créditos estende sua validade
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  Sem créditos válidos, apenas as telas de Perfil e Créditos ficam disponíveis
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buy credits CTA */}
        <div className="card-static p-6 bg-gradient-to-br from-card to-secondary/30 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(142_70%_45%)]/10 mb-4">
              <Plus className="h-7 w-7 text-[hsl(142_70%_45%)]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Precisa de mais créditos?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Entre em contato conosco via WhatsApp para adicionar créditos à sua conta rapidamente.
            </p>
            <Button
              variant="whatsapp"
              size="xl"
              className="w-full sm:w-auto"
              onClick={() => window.open(WHATSAPP_SUPPORT, '_blank')}
            >
              <MessageCircle className="h-5 w-5" />
              Comprar Créditos via WhatsApp
            </Button>
          </div>
        </div>

        {/* Credit history */}
        <div className="card-static p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Histórico de Créditos</h3>
          </div>

          {userHistory.length > 0 ? (
            <div className="space-y-3">
              {userHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      +{record.amount} crédito{record.amount > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Adicionado por {record.addedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(record.addedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum histórico de créditos</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Creditos;
