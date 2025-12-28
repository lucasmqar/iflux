import { useState } from 'react';
import { Building2, FileText, FileSpreadsheet, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from './StatusIndicator';
import { useMarkCompanyAsPaid, getPaymentMonth } from '@/hooks/useReports';
import { exportToExcel, formatDate, formatCurrency, getMonthName } from '@/lib/reportExport';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { CompanyReportGroup } from '@/hooks/useReports';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyReportCardProps {
  report: CompanyReportGroup;
  selectedMonth: string;
}

export const CompanyReportCard = ({ report, selectedMonth }: CompanyReportCardProps) => {
  const { user } = useAuth();
  const [showOrders, setShowOrders] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const markAsPaid = useMarkCompanyAsPaid();
  
  const handleExportExcel = () => {
    const orders = report.orders.map(order => ({
      id: order.id,
      date: formatDate(order.completed_at || order.created_at),
      dropoffAddress: order.order_deliveries?.[0]?.dropoff_address || 'N/A',
      value: Number(order.total_value),
    }));
    
    exportToExcel({
      companyName: report.companyName,
      driverName: user?.name || 'Entregador',
      period: getMonthName(selectedMonth),
      orders,
      totalValue: report.totalValue,
    }, `relatorio_${report.companyName.replace(/\s+/g, '_')}_${selectedMonth}`);
    
    toast.success('Relatório Excel exportado com sucesso!');
  };
  
  const handleExportPDF = () => {
    // For now, export as Excel since PDF requires more setup
    // TODO: Implement proper PDF export
    handleExportExcel();
    toast.info('Exportado como Excel. PDF em breve!');
  };
  
  const handleMarkAsPaid = async () => {
    try {
      await markAsPaid.mutateAsync({
        companyUserId: report.companyUserId,
        orders: report.orders,
      });
      toast.success(`Pagamento de ${report.companyName} registrado com sucesso!`);
      setShowConfirmDialog(false);
    } catch (error: any) {
      toast.error('Erro ao registrar pagamento: ' + error.message);
    }
  };
  
  return (
    <>
      <div className="card-static overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary">
                <Building2 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{report.companyName}</h3>
                  <StatusIndicator status={report.status} showLabel />
                </div>
                <p className="text-sm text-muted-foreground">
                  {report.orderCount} pedido(s) pendente(s)
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(report.totalValue)}
              </p>
              <p className="text-xs text-muted-foreground">A receber</p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex-1 min-w-[120px]"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="flex-1 min-w-[120px]"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              size="sm"
              onClick={() => setShowConfirmDialog(true)}
              disabled={markAsPaid.isPending || report.status === 'paid'}
              className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
            >
              {markAsPaid.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Marcar como Pago
            </Button>
          </div>
          
          {/* Expand/collapse orders */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOrders(!showOrders)}
            className="w-full mt-3"
          >
            {showOrders ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar pedidos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Ver {report.orderCount} pedido(s)
              </>
            )}
          </Button>
        </div>
        
        {/* Orders list */}
        {showOrders && (
          <div className="border-t border-border">
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {report.orders.map(order => (
                <div key={order.id} className="p-3 hover:bg-secondary/50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.completed_at || order.created_at)}
                      </p>
                      <p className="text-sm text-foreground truncate">
                        {order.order_deliveries?.[0]?.dropoff_address || 'Endereço não disponível'}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground shrink-0">
                      {formatCurrency(Number(order.total_value))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Recebimento</AlertDialogTitle>
            <AlertDialogDescription>
              Você confirma que recebeu o pagamento de <strong>{formatCurrency(report.totalValue)}</strong> referente a{' '}
              <strong>{report.orderCount} pedido(s)</strong> da empresa <strong>{report.companyName}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsPaid}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirmar Recebimento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
