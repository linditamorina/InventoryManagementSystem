import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Gabim te Supabase Fetch:", error.message);
        return [];
      }
      
      console.log("Të dhënat nga DB:", data); // Kjo do të tregojë nëse ka njoftime në DB
      return data || [];
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', 
        // Ndryshova 'INSERT' në '*' që të kapë edhe Update/Delete
        { event: '*', schema: 'public', table: 'notifications' }, 
        (payload) => {
          console.log("Ndryshim LIVE u detektua:", payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return { notifications, unreadCount };
}