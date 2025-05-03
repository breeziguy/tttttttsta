import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import PaystackButton from './PaystackButton';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  staff_access_percentage: number;
  duration_days: number;
  max_staff_selections: number;
  allow_pdf_download: boolean;
  plan_code: string;
}

interface SubscriptionManagerProps {
  currentPlan?: string;
  isDialog?: boolean;
}

export default function SubscriptionManager({ currentPlan, isDialog = false }: SubscriptionManagerProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const { profile } = useAuthStore();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        console.log('Fetching subscription data...');

        // Fetch subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });

        if (plansError) throw plansError;

        // Fetch active subscription if any
        if (profile?.id) {
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('client_subscriptions')
            .select('*, subscription_plans(*)')
            .eq('client_id', profile.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (subscriptionError) throw subscriptionError;
          setActiveSubscription(subscriptionData);
        }

        setPlans(plansData || []);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [profile?.id]);

  const handleUpgradeSuccess = async () => {
    window.location.reload();
  };

  const handleFreePlanActivation = async (plan: SubscriptionPlan) => {
    try {
      setSubscribing(true);
      
      // Create subscription record for free plan
      const { error: subscriptionError } = await supabase
        .from('client_subscriptions')
        .insert({
          client_id: profile?.id,
          plan_id: plan.id,
          payment_status: 'completed',
          amount_paid: 0,
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (subscriptionError) throw subscriptionError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('users_profile')
        .update({
          subscription_tier: plan.name.toLowerCase().replace(' plan', ''),
        })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      toast.success('Free plan activated successfully!');
      handleUpgradeSuccess();
    } catch (error) {
      console.error('Error activating free plan:', error);
      toast.error('Failed to activate free plan');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${isDialog ? 'md:grid-cols-1 lg:grid-cols-3' : 'md:grid-cols-3'} gap-6`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderPlan = (plan: SubscriptionPlan) => {
    const isCurrentPlan = activeSubscription?.subscription_plans?.id === plan.id;
    const isPopular = plan.name.toLowerCase().includes('standard');
    const isFree = plan.price === 0;
    
    return (
      <div
        key={plan.id}
        className={`relative bg-white rounded-xl shadow-sm overflow-hidden ${
          isCurrentPlan ? 'ring-2 ring-primary' : ''
        }`}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
            Popular
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
          <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
          
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
              </span>
              {plan.price > 0 && <span className="ml-1 text-sm font-semibold text-gray-500">/month</span>}
            </div>
            {plan.price > 0 && <p className="mt-1 text-xs text-gray-500">Billed monthly</p>}
          </div>

          <div className="mt-6">
            <ul className="space-y-3">
              {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="ml-3 text-sm text-gray-700">{feature}</p>
                </li>
              ))}
            </ul>
          </div>

          {isCurrentPlan ? (
            <button
              className="mt-8 w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            >
              Current Plan
            </button>
          ) : isFree ? (
            <button
              onClick={() => handleFreePlanActivation(plan)}
              disabled={subscribing}
              className="mt-8 w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {subscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate Free Plan'
              )}
            </button>
          ) : (
            <div className="mt-8">
              <PaystackButton
                plan={plan}
                onSuccess={handleUpgradeSuccess}
                onClose={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 ${isDialog ? 'md:grid-cols-1 lg:grid-cols-3' : 'md:grid-cols-3'} gap-6`}>
      {plans.map(plan => renderPlan(plan))}
    </div>
  );
}