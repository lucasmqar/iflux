import { useState } from 'react';
import { User, FileText, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToExcel, formatDate, formatCurrency, getMonthName } from '@/lib/reportExport';
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
  
  const handleExportExcel = () => {
    const orders = report.orders.map(order => ({
      id: order.id,
      date: formatDate(order.completed_at || order.created_at),
      dropoffAddress: order.order_deliveries?.[0]?.dropoff_address || 'N/A',
      value: Number(order.total_value),
    }));
    
    exportToExcel({
      companyName,
      driverName: report.driverName,
      period: getMonthName(selectedMonth),
      orders,
      totalValue: report.totalValue,
    }, `relatorio_${report.driverName.replace(/\s+/g, '_')}_${selectedMonth}`);
    
    toast.success('Relatório Excel exportado com sucesso!');
  };
  
  const handleExportPDF = () => {
    handleExportExcel();
    toast.info('Exportado como Excel. PDF em breve!');
  };
  
  return (
    <div className="card-static overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary">
              <User className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{report.driverName}</h3>
              <p className="text-sm text-muted-foreground">
                {report.orderCount} entrega(s) realizada(s)
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(report.totalValue)}
            </p>
            <p className="text-xs text-muted-foreground">Total pago</p>
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
  );
};
