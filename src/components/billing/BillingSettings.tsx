import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PricingPlans } from './PricingPlans';
import { useSubscription, PLANS } from '@/hooks/useSubscription';
import { format } from 'date-fns';

export function BillingSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    subscription, 
    paymentHistory, 
    loading, 
    currentPlan, 
    isActive,
    verifyPayment,
    cancelSubscription,
    processingPayment 
  } = useSubscription();

  // Handle payment verification on return from Paystack
  useEffect(() => {
    const shouldVerify = searchParams.get('verify') === 'true';
    const reference = localStorage.getItem('paystack_reference') || searchParams.get('reference');

    if (shouldVerify && reference) {
      verifyPayment(reference).then(() => {
        // Clean up URL params
        searchParams.delete('verify');
        searchParams.delete('reference');
        setSearchParams(searchParams);
      });
    }
  }, [searchParams, setSearchParams, verifyPayment]);

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
                  {subscription?.status || 'active'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                ${planInfo.price}/month
              </p>
            </div>
            {subscription?.current_period_end && isActive && (
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Renews {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                </div>
              </div>
            )}
          </div>

          {subscription?.status === 'cancelled' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subscription Cancelled</AlertTitle>
              <AlertDescription>
                Your subscription has been cancelled. You'll continue to have access until the end of your billing period.
              </AlertDescription>
            </Alert>
          )}

          {currentPlan !== 'free' && isActive && (
            <Button 
              variant="outline" 
              onClick={cancelSubscription}
              disabled={processingPayment}
            >
              Cancel Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Plans</h2>
        <PricingPlans />
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">
                      ${payment.amount} {payment.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant={payment.status === 'success' ? 'default' : 'secondary'}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
