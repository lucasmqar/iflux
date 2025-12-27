import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RealtimeNotificationOptions {
  showToasts?: boolean;
  soundEnabled?: boolean;
}

export const useRealtimeUpdates = (options: RealtimeNotificationOptions = {}): void => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToasts = true, soundEnabled = false } = options;

  const playNotificationSound = useCallback(() => {
    if (soundEnabled) {
      // Create a simple beep sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
      } catch (e) {
        console.log('Audio not available');
      }
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications for the current user
    const notificationsChannel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          
          if (showToasts) {
            const notification = payload.new as any;
            toast.info(notification.title, {
              description: notification.message,
            });
          }
          
          playNotificationSound();
        }
      )
      .subscribe();

    // Subscribe to order updates
    const ordersChannel = supabase
      .channel('orders-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order update:', payload);
          
          // Invalidate all order-related queries
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['order'] });
          
          // Role-specific notifications
          const order = payload.new as any;
          const oldOrder = payload.old as any;
          
          if (payload.eventType === 'UPDATE' && showToasts) {
            // Notify company when driver accepts their order
            if (order.company_user_id === user.id && 
                oldOrder?.status === 'pending' && 
                order.status === 'accepted') {
              toast.success('Pedido aceito!', {
                description: 'Um entregador aceitou seu pedido.',
              });
              playNotificationSound();
            }
            
            // Notify company when driver completes delivery
            if (order.company_user_id === user.id && 
                oldOrder?.status === 'accepted' && 
                order.status === 'driver_completed') {
              toast.success('Entrega realizada!', {
                description: 'O entregador finalizou a entrega. Confirme o recebimento.',
              });
              playNotificationSound();
            }
            
            // Notify driver when company confirms order
            if (order.driver_user_id === user.id && 
                oldOrder?.status === 'driver_completed' && 
                order.status === 'completed') {
              toast.success('Pedido concluído!', {
                description: 'A empresa confirmou a entrega.',
              });
              playNotificationSound();
            }
          }
          
          // Notify drivers of new available orders
          if (user.role === 'driver' && 
              payload.eventType === 'INSERT' && 
              order.status === 'pending' &&
              showToasts) {
            toast.info('Novo pedido disponível!', {
              description: 'Confira os pedidos disponíveis.',
            });
            playNotificationSound();
          }
        }
      )
      .subscribe();

    // Subscribe to order deliveries updates
    const deliveriesChannel = supabase
      .channel('deliveries-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_deliveries',
        },
        () => {
          // Invalidate delivery-related queries
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['order'] });
        }
      )
      .subscribe();

    // Subscribe to credits updates
    const creditsChannel = supabase
      .channel('credits-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Credits update:', payload);
          queryClient.invalidateQueries({ queryKey: ['credits', user.id] });
          
          if (payload.eventType === 'INSERT' && showToasts) {
            toast.success('Créditos adicionados!', {
              description: 'Seus créditos foram atualizados.',
            });
            playNotificationSound();
          }
        }
      )
      .subscribe();

    // Subscribe to admin alerts
    const alertsChannel = supabase
      .channel('alerts-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_alerts',
          filter: `target_user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Alert update:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-alerts', user.id] });
          
          if (payload.eventType === 'INSERT' && showToasts) {
            const alert = payload.new as any;
            if (alert.active) {
              toast.warning('Aviso importante', {
                description: alert.message,
                duration: 10000,
              });
              playNotificationSound();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(deliveriesChannel);
      supabase.removeChannel(creditsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [user, queryClient, showToasts, playNotificationSound]);

  return null;
};
