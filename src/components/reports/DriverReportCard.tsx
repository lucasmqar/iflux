import { useState } from 'react';
import { User, FileText, FileSpreadsheet, ChevronDown, ChevronUp, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToExcel, formatDate, formatCurrency, getMonthName } from '@/lib/reportExport';
import { generateReportPDF } from './ReportPDF';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { DriverReportGroup } from '@/hooks/useReports';

interface DriverReportCardProps {
  report: DriverReportGroup;
  selectedMonth: string;
  companyName: string;
}

export const DriverReportCard = ({ report, selectedMonth, companyName }: DriverReportCardProps) => {
  const { user } = useAuth();
  const [showOrders, setShowOrders] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const getOrdersData = () => report.orders.map(order => ({
    id: order.id,
    date: formatDate(order.completed_at || order.created_at),
    dropoffAddress: order.order_deliveries?.[0]?.dropoff_address || 'N/A',
    value: Number(order.total_value),
  }));
  
  const handleExportExcel = () => {
    exportToExcel({
      companyName,
      driverName: report.driverName,
      period: getMonthName(selectedMonth),
      orders: getOrdersData(),
      totalValue: report.totalValue,
    }, `relatorio_${report.driverName.replace(/\s+/g, '_')}_${selectedMonth}`);
    
    toast.success('Relatório Excel exportado com sucesso!');
  };
  
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generateReportPDF({
        companyName,
        driverName: report.driverName,
        period: getMonthName(selectedMonth),
        generatedAt: new Date().toLocaleDateString('pt-BR'),
        orders: getOrdersData(),
        totalValue: report.totalValue,
        isCompanyReport: true,
      }, `relatorio_${report.driverName.replace(/\s+/g, '_')}_${selectedMonth}`);
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExportingPDF(false);
    }
  };
  
  return (
    <div className="card-static overflow-hidden mx-1">
      <div className="p-3 sm:p-4">
        {/* Header with driver info and value */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 rounded-xl bg-secondary shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {report.driverName}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {report.orderCount} entrega(s) realizada(s)
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {formatCurrency(report.totalValue)}
              </p>
              <p className="text-xs text-muted-foreground">Total pago</p>
            </div>
            
            {/* Quick download button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="shrink-0 h-8 w-8 p-0 sm:hidden"
              title="Baixar PDF"
            >
              {isExportingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 sm:mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="text-xs sm:text-sm"
          >
            {isExportingPDF ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="text-xs sm:text-sm"
          >
            <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
            Excel
          </Button>
        </div>
        
        {/* Expand/collapse orders */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOrders(!showOrders)}
          className="w-full mt-3 text-xs sm:text-sm"
        >
          {showOrders ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar entregas
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver {report.orderCount} entrega(s)
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
                    <p className="text-xs sm:text-sm text-foreground truncate">
                      {order.order_deliveries?.[0]?.dropoff_address || 'Endereço não disponível'}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground shrink-0">
                    {formatCurrency(Number(order.total_value))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
