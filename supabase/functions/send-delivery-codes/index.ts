import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate 6-character alphanumeric code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hash code using SHA-256
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Send SMS via Twilio
async function sendTwilioSMS(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Missing Twilio credentials');
    return { success: false, error: 'Twilio credentials not configured' };
  }

  // Format phone number: ensure it has country code
  const cleanPhone = to.replace(/\D/g, '');
  const toFormatted = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = btoa(`${accountSid}:${authToken}`);

  try {
    console.log(`Sending SMS to ${toFormatted}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        To: toFormatted,
        From: fromNumber,
        Body: body,
      }),
    });

    const result = await response.json();
    console.log('Twilio response:', JSON.stringify(result));

    if (result.sid) {
      return { success: true, sid: result.sid };
    } else {
      return { success: false, error: result.message || 'Unknown error' };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, driverUserId } = await req.json();

    if (!orderId || !driverUserId) {
      return new Response(
        JSON.stringify({ error: 'orderId and driverUserId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing order ${orderId} for driver ${driverUserId}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the order exists and is assigned to this driver
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('driver_user_id', driverUserId)
      .eq('status', 'accepted')
      .single();

    if (orderError || !order) {
      console.error('Order not found or not assigned:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found or not assigned to this driver' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all deliveries for this order - now with direct customer_name and customer_phone
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('order_deliveries')
      .select('*')
      .eq('order_id', orderId);

    if (deliveriesError) {
      console.error('Error fetching deliveries:', deliveriesError);
      throw deliveriesError;
    }

    console.log(`Found ${deliveries?.length || 0} deliveries`);

    let sentCount = 0;
    let failedCount = 0;
    const results: { deliveryId: string; success: boolean; error?: string }[] = [];

    // Process each delivery
    for (const delivery of deliveries || []) {
      // Skip if code already sent
      if (delivery.code_sent_at) {
        console.log(`Delivery ${delivery.id} already has code sent, skipping`);
        results.push({ deliveryId: delivery.id, success: true });
        sentCount++;
        continue;
      }

      // Get customer phone - directly from delivery or from linked customer
      const customerPhone = delivery.customer_phone;
      const customerName = delivery.customer_name || 'Cliente';

      if (!customerPhone) {
        console.log(`Delivery ${delivery.id} has no customer phone, skipping SMS`);
        results.push({ deliveryId: delivery.id, success: false, error: 'No phone number' });
        failedCount++;
        continue;
      }

      // Generate new code
      const code = generateCode();
      const codeHash = await hashCode(code);

      // Update delivery with code hash
      const { error: updateError } = await supabase
        .from('order_deliveries')
        .update({
          code_hash: codeHash,
          code_sent_at: new Date().toISOString(),
        })
        .eq('id', delivery.id);

      if (updateError) {
        console.error(`Error updating delivery ${delivery.id}:`, updateError);
        results.push({ deliveryId: delivery.id, success: false, error: 'Database update failed' });
        failedCount++;
        continue;
      }

      // Send SMS
      const message = `🔐 FLUX - Código de Entrega

Olá ${customerName}! Seu pedido está a caminho.

Código de validação: ${code}

⚠️ Informe este código APENAS ao entregador no momento da entrega.

Não compartilhe com ninguém!`;

      const smsResult = await sendTwilioSMS(customerPhone, message);

      if (smsResult.success) {
        console.log(`SMS sent successfully to ${customerPhone}, SID: ${smsResult.sid}`);
        sentCount++;
        results.push({ deliveryId: delivery.id, success: true });
      } else {
        console.error(`Failed to send SMS to ${customerPhone}:`, smsResult.error);
        failedCount++;
        results.push({ deliveryId: delivery.id, success: false, error: smsResult.error });
      }
    }

    console.log(`Completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-delivery-codes:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
