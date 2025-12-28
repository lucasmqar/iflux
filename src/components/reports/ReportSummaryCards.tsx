import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportSummary } from '@/hooks/useReports';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  role: 'driver' | 'company';
  isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const ReportSummaryCards = ({ summary, role, isLoading }: ReportSummaryCardsProps) => {
  if (role === 'driver') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Valor Pendente */}
        <div className="card-static p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-yellow-100 dark:bg-yellow-900/40">
              <Wallet className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Valor Pendente</span>
          </div>
          <p className={cn(
            "text-2xl font-bold text-foreground",
            isLoading && "animate-pulse bg-muted rounded h-8 w-32"
          )}>
            {!isLoading && formatCurrency(summary.pendingValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.pendingCount} pedido(s) a receber
          </p>
        </div>

        {/* Valor Pago (Mês) */}
        <div className="card-static p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Recebido (Mês)</span>
          </div>
          <p className={cn(
            "text-2xl font-bold text-foreground",
            isLoading && "animate-pulse bg-muted rounded h-8 w-32"
          )}>
            {!isLoading && formatCurrency(summary.paidValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.paidCount} pedido(s) pago(s)
          </p>
        </div>

        {/* Acumulado Geral */}
        <div className="card-static p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Acumulado Geral</span>
          </div>
          <p className={cn(
            "text-2xl font-bold text-foreground",
            isLoading && "animate-pulse bg-muted rounded h-8 w-32"
          )}>
            {!isLoading && formatCurrency(summary.totalValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.totalCount} entrega(s) realizadas
          </p>
        </div>
      </div>
    );
  }

  // Company view
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Gasto */}
      <div className="card-static p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Total em Entregas</span>
        </div>
        <p className={cn(
          "text-2xl font-bold text-foreground",
          isLoading && "animate-pulse bg-muted rounded h-8 w-32"
        )}>
          {!isLoading && formatCurrency(summary.projectedSpending || summary.totalValue)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {summary.totalCount} entrega(s) realizadas
        </p>
      </div>

      {/* Economia Estimada */}
      <div className="card-static p-5 border-2 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            <PiggyBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Economia com FLUX</span>
        </div>
        <p className={cn(
          "text-2xl font-bold text-emerald-600 dark:text-emerald-400",
          isLoading && "animate-pulse bg-muted rounded h-8 w-32"
        )}>
          {!isLoading && formatCurrency(summary.estimatedSavings || 0)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ~10% de economia vs. apps tradicionais
        </p>
      </div>

      {/* Entregas Realizadas */}
      <div className="card-static p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40">
            <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Entregas Realizadas</span>
        </div>
        <p className={cn(
          "text-2xl font-bold text-foreground",
          isLoading && "animate-pulse bg-muted rounded h-8 w-32"
        )}>
          {!isLoading && summary.totalCount}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Total de entregas concluídas
        </p>
      </div>
    </div>
  );
};
