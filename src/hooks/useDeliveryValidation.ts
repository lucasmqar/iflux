import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Generate a random 6-character alphanumeric code (client-side for display)
export const generateDeliveryCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Hash a code using SHA-256 (browser crypto API)
export const hashDeliveryCode = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Hook to validate a delivery code (for drivers)
export const useValidateDeliveryCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      deliveryId, 
      code, 
      driverUserId 
    }: { 
      deliveryId: string; 
      code: string; 
      driverUserId: string;
    }) => {
      // Hash the code on client side
      const codeHash = await hashDeliveryCode(code.toUpperCase().trim());
      
      // Get the stored hash from the delivery
      const { data: delivery, error: fetchError } = await supabase
        .from('order_deliveries')
        .select('code_hash, validation_attempts, validated_at, order_id')
        .eq('id', deliveryId)
        .single();
      
      if (fetchError) throw new Error('Entrega não encontrada');
      if (!delivery.code_hash) throw new Error('Código não configurado para esta entrega');
      if (delivery.validated_at) throw new Error('Entrega já foi validada');
      if (delivery.validation_attempts >= 5) throw new Error('Limite de tentativas excedido');
      
      // Check if driver is assigned to this order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('driver_user_id')
        .eq('id', delivery.order_id)
        .single();
      
      if (orderError) throw new Error('Pedido não encontrado');
      if (order.driver_user_id !== driverUserId) throw new Error('Você não é o entregador deste pedido');
      
      // Log the attempt
      await supabase
        .from('delivery_audit_logs')
        .insert({
          delivery_id: deliveryId,
          driver_user_id: driverUserId,
          attempted_code: code.toUpperCase().trim(),
          success: codeHash === delivery.code_hash,
        });
      
      // Increment attempts
      await supabase
        .from('order_deliveries')
        .update({ validation_attempts: (delivery.validation_attempts || 0) + 1 })
        .eq('id', deliveryId);
      
      // Check if code matches
      if (codeHash === delivery.code_hash) {
        // Mark as validated
        const { error: updateError } = await supabase
          .from('order_deliveries')
          .update({ validated_at: new Date().toISOString() })
          .eq('id', deliveryId);
        
        if (updateError) throw updateError;
        
        return { success: true, message: 'Código validado com sucesso!' };
      } else {
        const remaining = 5 - (delivery.validation_attempts + 1);
        throw new Error(`Código inválido. Restam ${remaining} tentativa${remaining !== 1 ? 's' : ''}.`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

// Hook to set delivery code hash (for order creation)
export const useSetDeliveryCodeHash = () => {
  return useMutation({
    mutationFn: async ({ 
      deliveryId, 
      codeHash 
    }: { 
      deliveryId: string; 
      codeHash: string;
    }) => {
      const { error } = await supabase
        .from('order_deliveries')
        .update({ code_hash: codeHash })
        .eq('id', deliveryId);
      
      if (error) throw error;
    },
  });
};

// Store codes temporarily in memory during order creation
// These will be shown to the company and sent to customers
export interface DeliveryCodeMap {
  [deliveryId: string]: string; // plain text code
}
