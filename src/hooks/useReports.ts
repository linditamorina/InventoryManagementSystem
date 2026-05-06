import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { exportUtils } from '../utils/exportUtils';

export function useReports(startDate: string, endDate: string) {
  
  // Leximi i të dhënave të raportit automatikisht kur ndryshojnë datat
  const reportQuery = useQuery({
    queryKey: ['sales_report', startDate, endDate],
    queryFn: () => reportService.getSalesData(startDate, endDate),
    enabled: !!startDate && !!endDate, // Mos kërko nëse datat janë bosh
  });

  // Funksion i gatshëm për butonin "Export to CSV"
  const handleExportCSV = () => {
    if (reportQuery.data && reportQuery.data.orders.length > 0) {
      // Formatojmë emrin e skedarit sipas datave
      const fileName = `Raporti_Shitjeve_${startDate}_deri_${endDate}`;
      
      // Eksportojmë vetëm listën e faturave
      exportUtils.downloadCSV(reportQuery.data.orders, fileName);
    }
  };

  return {
    reportData: reportQuery.data,
    isLoading: reportQuery.isLoading,
    error: reportQuery.error,
    exportToCSV: handleExportCSV
  };
}