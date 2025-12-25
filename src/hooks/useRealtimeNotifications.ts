import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeNotifications = (userId?: string, userRole?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new orders (for drivers)
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (userRole === 'driver') {
            toast.info('🚚 Novo pedido disponível!', {
              description: 'Um novo pedido está aguardando entregador',
              duration: 5000,
            });
            queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newStatus = payload.new?.status;
          const companyUserId = payload.new?.company_user_id;
          const driverUserId = payload.new?.driver_user_id;

          // Notify company when order is accepted
          if (newStatus === 'accepted' && companyUserId === userId) {
            toast.success('✅ Pedido aceito!', {
              description: 'Um entregador aceitou seu pedido',
              duration: 5000,
            });
          }

          // Notify company when driver completed
          if (newStatus === 'driver_completed' && companyUserId === userId) {
            toast.success('📦 Entrega finalizada!', {
              description: 'O entregador finalizou a entrega. Confirme o recebimento.',
              duration: 5000,
            });
          }

          // Notify driver when company confirmed
          if (newStatus === 'completed' && driverUserId === userId) {
            toast.success('🎉 Entrega confirmada!', {
              description: 'A empresa confirmou o recebimento',
              duration: 5000,
            });
          }

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new;
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
          });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [userId, userRole, queryClient]);
};
