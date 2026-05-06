// src/hooks/usePredictor.ts
import { useQuery } from '@tanstack/react-query';
import { stockPredictorService } from '../services/stockPredictorService';
// Importojmë hook-un e gjuhës
import { useLanguage } from '../context/LanguageContext';

type StockPrediction = {
  product_id: string;
  status: 'CRITICAL' | 'WARNING' | 'GOOD' | string;
};

export function usePredictor(daysHistory: number = 30) {
  // Marrim funksionin t për përkthime
  const { t } = useLanguage();

  const { data: predictions } = useQuery({
    queryKey: ['stock-predictions', daysHistory],
    queryFn: () => stockPredictorService.getPredictions(daysHistory),
  });

  const calculateSuggestion = (current: number, min: number = 2) => {
    const safetyBuffer = Math.max(10, min * 3);
    const suggested = safetyBuffer - current;
    return suggested > 0 ? suggested : 5;
  };

  const getStockStatus = (productId: string, currentStock: number, minStockLevel?: number) => {
    const min = minStockLevel ?? 2;
    const toOrder = calculateSuggestion(currentStock, min);
    
    // 1. Nëse stoku është 0 ose më pak
    if (currentStock <= 0) {
      return { 
        // Përdorim t() me parametër për numrin e copëve
        message: `${t('status_empty')} (+${toOrder} CP)`, 
        color: "red",
        suggestion: toOrder 
      };
    }

    // 2. Limiti manual
    if (currentStock <= min) {
      return { 
        message: `${t('status_low')} (+${toOrder} CP)`, 
        color: "orange",
        suggestion: toOrder
      };
    }

    const prediction = predictions?.find((p: StockPrediction) => p.product_id === productId);
    
    if (!prediction) return { message: t('no_data'), color: "gray" };
    
    switch (prediction.status) {
      case 'CRITICAL':
        return { 
          message: `${t('status_empty')} (+${toOrder} CP)`, 
          color: "red",
          suggestion: toOrder
        };
      case 'WARNING':
        return { 
          message: `${t('status_low')} (+${toOrder} CP)`, 
          color: "orange",
          suggestion: toOrder
        };
      case 'GOOD':
        return { message: t('status_ok'), color: "emerald" };
      default:
        return { message: t('no_data'), color: "gray" };
    }
  };

  return { getStockStatus, predictions };
}