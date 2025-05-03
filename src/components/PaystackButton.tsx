import { usePaystackPayment } from 'react-paystack';
import { useAuthStore } from '../store/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PaystackButtonProps {
  plan: {
    id: string;
    name: string;
    price: number;
    plan_code: string;
  };
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function PaystackButton({ plan, onSuccess, onClose }: PaystackButtonProps) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Validate required configuration
  if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
    console.error('Paystack configuration missing');
    return (
      <button
        disabled
        className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg cursor-not-allowed"
      >
        Payment not available
      </button>
    );
  }

  // Validate plan code
  if (!plan.plan_code) {
    console.error('Plan code not found:', plan);
    return (
      <button
        disabled
        className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg cursor-not-allowed"
      >
        Invalid plan configuration
      </button>
    );
  }

  const config = {
    reference: `sub_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    email: profile?.email || '',
    amount: plan.price * 100, // Convert to kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    plan: plan.plan_code,
    currency: 'NGN',
    channels: ['card'],
    metadata: {
      plan_id: plan.id,
      plan_name: plan.name,
      user_id: profile?.id,
      custom_fields: [
        {
          display_name: "Plan Type",
          variable_name: "plan_type",
          value: plan.name
        }
      ]
    },
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaymentSuccess = async (response: any) => {
    try {
      setVerifying(true);
      console.log('Payment successful, verifying...', response);

      // Verify payment with Supabase Edge Function
      const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          reference: response.reference,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verificationData = await verifyResponse.json();
      console.log('Payment verified:', verificationData);
      
      if (!verificationData.success) {
        throw new Error(verificationData.error || 'Payment verification failed');
      }

      // Deactivate any existing active subscriptions
      const { error: deactivateError } = await supabase
        .from('client_subscriptions')
        .update({ is_active: false })
        .eq('client_id', profile?.id)
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating existing subscriptions:', deactivateError);
      }

      // Create new subscription record
      const { error: subscriptionError } = await supabase
        .from('client_subscriptions')
        .insert({
          client_id: profile?.id,
          plan_id: plan.id,
          payment_reference: response.reference,
          payment_status: 'completed',
          amount_paid: plan.price,
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

      if (subscriptionError) {
        console.error('Subscription creation error:', subscriptionError);
        throw subscriptionError;
      }

      // Update user profile with new subscription tier
      const { error: profileError } = await supabase
        .from('users_profile')
        .update({
          subscription_tier: plan.name.toLowerCase().replace(' plan', ''),
        })
        .eq('id', profile?.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Create activity log entry
      const { error: activityError } = await supabase
        .from('activity_log')
        .insert({
          user_id: profile?.id,
          activity_type: 'subscription_purchase',
          description: `Subscribed to ${plan.name}`,
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            amount: plan.price,
            reference: response.reference
          }
        });

      if (activityError) {
        console.error('Activity log error:', activityError);
      }

      toast.success('Subscription activated successfully!');
      onSuccess?.();

      // Force profile refresh to update UI
      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();

    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.error('Failed to process subscription. Please contact support.');
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    console.log('Payment cancelled by user');
    toast('Payment cancelled', {
      icon: '❌',
    });
    onClose?.();
    setLoading(false);
  };

  const buttonState = () => {
    if (loading) return 'Processing payment...';
    if (verifying) return 'Verifying payment...';
    return 'Subscribe Now';
  };

  const buttonIcon = () => {
    if (loading || verifying) {
      return <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />;
    }
    return null;
  };

  return (
    <button
      onClick={() => {
        if (!loading && !verifying) {
          setLoading(true);
          console.log('Initializing payment with config:', config);
          initializePayment(handlePaymentSuccess, handlePaymentClose);
        }
      }}
      disabled={loading || verifying}
      className="w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {buttonIcon()}
      {buttonState()}
    </button>
  );
}