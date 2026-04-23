import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '../services/stockService';
import { InsertStockMovement } from '../types';
import { useNotifications } from './useNotification';  // ✅ SHTOJMË IMPORT

export function useProductMovements(productId: string) {
  return useQuery({
    queryKey: ['stock_movements', productId],
    queryFn: () => stockService.getMovementsByProduct(productId),
    enabled: !!productId,
  });
}

export function useRecordMovement() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();  // ✅ SHTOJMË useNotifications

  return useMutation({
    mutationFn: (movement: InsertStockMovement) => stockService.recordMovement(movement),
    onSuccess: async (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['stock_movements', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-predictions'] });

      // Merr produktin për të kontrolluar nivelin e stokut
      const products = queryClient.getQueryData(['products']) as any[];
      const product = products.find(p => p.id === variables.product_id);

      if (product) {
        // Logjika për gjenerimin e notifications
        if (variables.type === 'OUT' && product.quantity - variables.quantity <= product.min_stock_level) {
          await addNotification(`Produkti ${product.name} ka arritur nivelin minimal të stokut!`);
        }

        if (variables.type === 'IN' && product.quantity - variables.quantity < product.min_stock_level && product.quantity >= product.min_stock_level) {
          await addNotification(`Produkti ${product.name} u rikthye mbi nivelin minimal të stokut!`);
        }
      }
    },
  });
}
