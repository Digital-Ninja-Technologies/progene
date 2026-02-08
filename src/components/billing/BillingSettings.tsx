import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingPlans } from './PricingPlans';
import { useSubscription, PLANS } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function BillingSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    subscription, 
    loading, 
    currentPlan, 
    isActive,
    openCustomerPortal,
    checkSubscription,
    processingPayment 
  } = useSubscription();

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Subscription activated successfully!');
      // Multiple refreshes to ensure we get the updated status
      checkSubscription();
      const timer1 = setTimeout(() => checkSubscription(), 2000);
      const timer2 = setTimeout(() => checkSubscription(), 5000);
      
      // Clean up URL params
      searchParams.delete('success');
      setSearchParams(searchParams);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    if (canceled === 'true') {
      toast.info('Checkout was canceled');
      searchParams.delete('canceled');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, checkSubscription]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const planInfo = PLANS[currentPlan as keyof typeof PLANS];

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{planInfo.name}</h3>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'active' : 'free'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {planInfo.currency}{planInfo.price}/month
              </p>
            </div>
            {subscription?.subscription_end && isActive && (
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Renews {format(new Date(subscription.subscription_end), 'MMM d, yyyy')}
                </div>
              </div>
            )}
          </div>

          {isActive && (
            <Button 
              variant="outline" 
              onClick={openCustomerPortal}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Plans</h2>
        <PricingPlans />
      </div>
    </div>
  );
}
