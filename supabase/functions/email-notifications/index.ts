import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface EmailPayload {
  to: string;
  type: 'welcome' | 'payment_success' | 'subscription_renewal' | 'subscription_cancelled';
  data: {
    name?: string;
    plan?: string;
    amount?: number;
    nextRenewalDate?: string;
    [key: string]: any;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: EmailPayload = await req.json();
    const { to, type, data } = payload;

    // Email templates
    const templates = {
      welcome: {
        subject: 'Welcome to Our Platform!',
        html: `
          <h1>Welcome ${data.name}!</h1>
          <p>Thank you for joining our platform. We're excited to help you find the perfect staff for your needs.</p>
          <p>Your account has been set up with our ${data.plan} plan.</p>
        `,
      },
      payment_success: {
        subject: 'Payment Successful',
        html: `
          <h1>Payment Successful</h1>
          <p>Dear ${data.name},</p>
          <p>Your payment of ₦${data.amount?.toLocaleString()} for the ${data.plan} plan has been processed successfully.</p>
          <p>Your subscription is now active and will renew on ${data.nextRenewalDate}.</p>
        `,
      },
      subscription_renewal: {
        subject: 'Subscription Renewal Reminder',
        html: `
          <h1>Subscription Renewal Reminder</h1>
          <p>Dear ${data.name},</p>
          <p>Your ${data.plan} plan subscription will renew on ${data.nextRenewalDate}.</p>
          <p>The renewal amount will be ₦${data.amount?.toLocaleString()}.</p>
        `,
      },
      subscription_cancelled: {
        subject: 'Subscription Cancelled',
        html: `
          <h1>Subscription Cancelled</h1>
          <p>Dear ${data.name},</p>
          <p>Your ${data.plan} plan subscription has been cancelled.</p>
          <p>You'll continue to have access until ${data.endDate}.</p>
        `,
      },
    };

    const template = templates[type];

    // Send email using Supabase's built-in email service
    const { error } = await supabase.auth.admin.sendEmail(to, {
      subject: template.subject,
      html: template.html,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});