import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SubscriptionData {
  subscribed: boolean;
  plan: 'free' | 'pro' | 'agency';
  subscription_end: string | null;
  subscription_id?: string;
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    currency: '$',
    proposals: 3,
    features: ['3 proposals/month', 'Basic templates', 'PDF export'],
  },
  pro: {
    name: 'Pro',
    price: 15,
    currency: '$',
    proposals: Infinity,
    features: ['Unlimited proposals', 'All templates', 'Custom branding', 'Client portal', 'Analytics'],
  },
  agency: {
    name: 'Agency',
    price: 35,
    currency: '$',
    proposals: Infinity,
    features: ['Everything in Pro', 'Team collaboration', 'Priority support', 'API access', 'White-label exports'],
  },
} as const;

export function useSubscription() {
  const { user, session } = useAuthContext();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data as SubscriptionData);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ subscribed: false, plan: 'free', subscription_end: null });
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh subscription status periodically
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const createCheckout = async (plan: 'pro' | 'agency') => {
    if (!user || !session) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setProcessingPayment(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast.error('Please sign in first');
      return;
    }

    setProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Customer portal error:', error);
      toast.error(error.message || 'Failed to open subscription management');
    } finally {
      setProcessingPayment(false);
    }
  };

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.subscribed || false;
  const isPremium = isActive && (currentPlan === 'pro' || currentPlan === 'agency');

  return {
    subscription,
    loading,
    processingPayment,
    currentPlan,
    isActive,
    isPremium,
    createCheckout,
    openCustomerPortal,
    checkSubscription,
  };
}
