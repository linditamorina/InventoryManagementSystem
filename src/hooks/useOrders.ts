import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { SalePayload } from '../types';

export function useOrders() {
  const queryClient = useQueryClient();

  const createSaleMutation = useMutation({
    mutationFn: (payload: SalePayload) => orderService.createSaleTransaction(payload),
    onSuccess: () => {
      // Rifreskojmë gjithçka në të gjithë aplikacionin
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stock_movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Stoku i ri do të shfaqet menjëherë!
    },
  });

  return {
    createSale: createSaleMutation.mutateAsync,
    isCreating: createSaleMutation.isPending,
  };
}