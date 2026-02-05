import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'agency';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: string;
  paystack_reference: string | null;
  created_at: string;
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    currency: '₦',
    proposals: 3,
    features: ['3 proposals/month', 'Basic templates', 'PDF export'],
  },
  pro: {
    name: 'Pro',
    price: 15000,
    currency: '₦',
    proposals: Infinity,
    features: ['Unlimited proposals', 'All templates', 'Custom branding', 'Client portal', 'Analytics'],
  },
  agency: {
    name: 'Agency',
    price: 35000,
    currency: '₦',
    proposals: Infinity,
    features: ['Everything in Pro', 'Team collaboration', 'Priority support', 'API access', 'White-label exports'],
  },
} as const;

export function useSubscription() {
  const { user, session } = useAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data as Subscription | null);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentHistory(data as PaymentHistory[]);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
    fetchPaymentHistory();
  }, [fetchSubscription, fetchPaymentHistory]);

  const initializePayment = async (plan: 'pro' | 'agency') => {
    if (!user || !session) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('paystack/initialize', {
        body: {
          plan,
          email: user.email,
          callback_url: `${window.location.origin}/settings?tab=billing&verify=true`,
        },
      });

      if (error) throw error;

      if (data.authorization_url) {
        // Store reference for verification
        localStorage.setItem('paystack_reference', data.reference);
        // Redirect to Paystack checkout
        window.location.href = data.authorization_url;
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error(error.message || 'Failed to initialize payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('paystack/verify', {
        body: { reference },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Successfully upgraded to ${data.plan}!`);
        await fetchSubscription();
        localStorage.removeItem('paystack_reference');
        return true;
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error(error.message || 'Payment verification failed');
    } finally {
      setProcessingPayment(false);
    }

    return false;
  };

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('paystack/cancel', {
        body: {},
      });

      if (error) throw error;

      toast.success('Subscription cancelled');
      await fetchSubscription();
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.status === 'active';
  const isPremium = isActive && (currentPlan === 'pro' || currentPlan === 'agency');

  return {
    subscription,
    paymentHistory,
    loading,
    processingPayment,
    currentPlan,
    isActive,
    isPremium,
    initializePayment,
    verifyPayment,
    cancelSubscription,
    fetchSubscription,
    fetchPaymentHistory,
  };
}
