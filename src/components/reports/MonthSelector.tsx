import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPaymentMonth, getLastDayOfMonth } from '@/hooks/useReports';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const getMonthName = (monthStr: string): string => {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

const parseMonth = (monthStr: string): { year: number; month: number } => {
  const [year, month] = monthStr.split('-').map(Number);
  return { year, month };
};

const formatMonth = (year: number, month: number): string => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

export const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const currentMonth = getPaymentMonth();
  const { year, month } = parseMonth(selectedMonth);
  const isCurrentMonth = selectedMonth === currentMonth;
  
  // Calculate days until month end
  const today = new Date();
  const lastDay = getLastDayOfMonth(year, month - 1);
  const daysUntilClose = Math.max(0, Math.ceil((lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(formatMonth(newYear, newMonth));
  };
  
  const handleNextMonth = () => {
    // Don't allow going to future months
    const nextMonthStr = formatMonth(
      month === 12 ? year + 1 : year,
      month === 12 ? 1 : month + 1
    );
    if (nextMonthStr <= currentMonth) {
      let newMonth = month + 1;
      let newYear = year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      onMonthChange(formatMonth(newYear, newMonth));
    }
  };
  
  const canGoNext = () => {
    const nextMonthStr = formatMonth(
      month === 12 ? year + 1 : year,
      month === 12 ? 1 : month + 1
    );
    return nextMonthStr <= currentMonth;
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 card-static">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="min-w-[180px] text-center">
          <p className="text-lg font-semibold text-foreground capitalize">
            {getMonthName(selectedMonth)}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleNextMonth}
          disabled={!canGoNext()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {isCurrentMonth && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Relatório em andamento • Fecha em {daysUntilClose} dia(s)
          </span>
        </div>
      )}
      
      {!isCurrentMonth && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Relatório fechado
          </span>
        </div>
      )}
    </div>
  );
};
