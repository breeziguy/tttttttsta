import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('client_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('client_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Check if subscription is expired
    if (subscription && new Date(subscription.end_date) < new Date()) {
      // Deactivate expired subscription
      const { error: updateError } = await supabase
        .from('client_subscriptions')
        .update({ is_active: false })
        .eq('id', subscription.id);

      if (updateError) {
        throw updateError;
      }

      // Update user profile to free plan
      const { error: profileError } = await supabase
        .from('users_profile')
        .update({ subscription_tier: 'free' })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      return new Response(
        JSON.stringify({
          status: 'expired',
          message: 'Subscription has expired',
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        status: 'active',
        subscription: subscription || null,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message 
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