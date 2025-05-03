import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting payment verification...');
    const { reference } = await req.json();

    if (!reference) {
      console.error('Payment reference is required');
      throw new Error('Payment reference is required');
    }

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      console.error('Paystack secret key not configured');
      throw new Error('Paystack secret key not configured');
    }

    console.log('Verifying payment with Paystack...', { reference });

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      console.error('Paystack verification failed:', errorData);
      throw new Error(`Paystack verification failed: ${errorData.message || 'Unknown error'}`);
    }

    const verificationData = await verifyResponse.json();
    console.log('Payment verification response:', verificationData);

    // Validate payment status
    if (verificationData.data.status !== 'success') {
      console.error('Payment verification failed:', verificationData.data.gateway_response);
      throw new Error(`Payment verification failed: ${verificationData.data.gateway_response}`);
    }

    console.log('Payment verified successfully');
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          amount: verificationData.data.amount / 100, // Convert from kobo to naira
          reference: verificationData.data.reference,
          status: verificationData.data.status,
          transaction_date: verificationData.data.transaction_date,
          customer: {
            email: verificationData.data.customer.email,
          },
          metadata: verificationData.data.metadata,
        },
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Payment verification failed' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});