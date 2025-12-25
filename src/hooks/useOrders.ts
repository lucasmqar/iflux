import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, Enums } from '@/integrations/supabase/types';

export type Order = Tables<'orders'>;
export type OrderDelivery = Tables<'order_deliveries'>;
export type OrderStatus = Enums<'order_status'>;
export type PackageType = Enums<'package_type'>;

export interface OrderWithDeliveries extends Order {
  order_deliveries: OrderDelivery[];
}

export const useOrders = (companyUserId?: string) => {
  return useQuery({
    queryKey: ['orders', 'company', companyUserId],
    queryFn: async () => {
      if (!companyUserId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_deliveries(*)
        `)
        .eq('company_user_id', companyUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderWithDeliveries[];
    },
    enabled: !!companyUserId,
  });
};

export const useDriverOrders = (driverUserId?: string) => {
  return useQuery({
    queryKey: ['orders', 'driver', driverUserId],
    queryFn: async () => {
      if (!driverUserId) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_deliveries(*)
        `)
        .eq('driver_user_id', driverUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderWithDeliveries[];
    },
    enabled: !!driverUserId,
  });
};

export const useAvailableOrders = () => {
  return useQuery({
    queryKey: ['orders', 'available'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_deliveries(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderWithDeliveries[];
    },
  });
};

export const useOrder = (orderId?: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_deliveries(*)
        `)
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      return data as OrderWithDeliveries | null;
    },
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      order, 
      deliveries 
    }: { 
      order: Omit<TablesInsert<'orders'>, 'id' | 'created_at' | 'updated_at'>; 
      deliveries: Omit<TablesInsert<'order_deliveries'>, 'id' | 'order_id' | 'created_at'>[];
    }) => {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create deliveries
      const deliveriesWithOrderId = deliveries.map(d => ({
        ...d,
        order_id: orderData.id,
      }));
      
      const { error: deliveriesError } = await supabase
        .from('order_deliveries')
        .insert(deliveriesWithOrderId);
      
      if (deliveriesError) throw deliveriesError;
      
      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      driverUserId 
    }: { 
      orderId: string; 
      status: OrderStatus; 
      driverUserId?: string;
    }) => {
      const updates: Partial<Order> = { status };
      
      if (status === 'accepted' && driverUserId) {
        updates.driver_user_id = driverUserId;
        updates.accepted_at = new Date().toISOString();
      } else if (status === 'driver_completed') {
        updates.driver_completed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
    },
  });
};
