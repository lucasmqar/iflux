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

// Validation constants matching database constraints
const MAX_ADDRESS_LENGTH = 500;
const MIN_ADDRESS_LENGTH = 5;
const MAX_NOTES_LENGTH = 500;
const MIN_PRICE = 0;
const MAX_PRICE = 10000;
const MAX_TOTAL_VALUE = 100000;

const validateDelivery = (delivery: Omit<TablesInsert<'order_deliveries'>, 'id' | 'order_id' | 'created_at'>) => {
  if (!delivery.pickup_address || delivery.pickup_address.length < MIN_ADDRESS_LENGTH) {
    throw new Error('Endereço de retirada muito curto (mínimo 5 caracteres)');
  }
  if (delivery.pickup_address.length > MAX_ADDRESS_LENGTH) {
    throw new Error('Endereço de retirada muito longo (máximo 500 caracteres)');
  }
  if (!delivery.dropoff_address || delivery.dropoff_address.length < MIN_ADDRESS_LENGTH) {
    throw new Error('Endereço de entrega muito curto (mínimo 5 caracteres)');
  }
  if (delivery.dropoff_address.length > MAX_ADDRESS_LENGTH) {
    throw new Error('Endereço de entrega muito longo (máximo 500 caracteres)');
  }
  if (delivery.notes && delivery.notes.length > MAX_NOTES_LENGTH) {
    throw new Error('Observações muito longas (máximo 500 caracteres)');
  }
  if (delivery.suggested_price < MIN_PRICE || delivery.suggested_price > MAX_PRICE) {
    throw new Error(`Preço inválido (deve ser entre R$${MIN_PRICE} e R$${MAX_PRICE})`);
  }
};

// Result type for order creation
export interface CreateOrderResult {
  order: Order;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      order, 
      deliveries 
    }: { 
      order: Omit<TablesInsert<'orders'>, 'id' | 'created_at' | 'updated_at'>; 
      deliveries: (Omit<TablesInsert<'order_deliveries'>, 'id' | 'order_id' | 'created_at' | 'code_hash' | 'validation_attempts'> & {
        customer_name?: string;
        customer_phone?: string;
      })[];
    }): Promise<CreateOrderResult> => {
      // Validate all deliveries before inserting
      deliveries.forEach(validateDelivery);
      
      // Validate total value
      if (order.total_value < MIN_PRICE || order.total_value > MAX_TOTAL_VALUE) {
        throw new Error(`Valor total inválido (deve ser entre R$${MIN_PRICE} e R$${MAX_TOTAL_VALUE})`);
      }
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create deliveries (codes will be generated when driver accepts)
      const deliveriesWithOrderId = deliveries.map(d => ({
        ...d,
        order_id: orderData.id,
        validation_attempts: 0,
      }));
      
      const { error: deliveriesError } = await supabase
        .from('order_deliveries')
        .insert(deliveriesWithOrderId);
      
      if (deliveriesError) throw deliveriesError;
      
      return { order: orderData };
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

      // Send delivery codes via Twilio when order is accepted
      if (status === 'accepted' && driverUserId) {
        try {
          console.log('Sending delivery codes via edge function...');
          const { data: sendResult, error: sendError } = await supabase.functions.invoke('send-delivery-codes', {
            body: { orderId, driverUserId }
          });
          
          if (sendError) {
            console.error('Error sending delivery codes:', sendError);
          } else {
            console.log('Delivery codes sent:', sendResult);
          }
        } catch (e) {
          console.error('Failed to call send-delivery-codes function:', e);
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
    },
  });
};
