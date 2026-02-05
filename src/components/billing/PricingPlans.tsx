import { Check, Zap, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PLANS } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

export function PricingPlans() {
  const { currentPlan, isActive, initializePayment, processingPayment, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Free Plan */}
      <Card className={cn(
        "relative",
        currentPlan === 'free' && "ring-2 ring-primary"
      )}>
        {currentPlan === 'free' && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Free
          </CardTitle>
          <CardDescription>Perfect for getting started</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">₦0</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {PLANS.free.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" disabled>
            {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
          </Button>
        </CardFooter>
      </Card>

      {/* Pro Plan */}
      <Card className={cn(
        "relative border-primary",
        currentPlan === 'pro' && "ring-2 ring-primary"
      )}>
        {currentPlan === 'pro' ? (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>
        ) : (
          <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Pro
          </CardTitle>
          <CardDescription>For growing freelancers</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">₦{PLANS.pro.price.toLocaleString()}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {PLANS.pro.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            disabled={currentPlan === 'pro' || processingPayment}
            onClick={() => initializePayment('pro')}
          >
            {processingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentPlan === 'pro' ? (
              'Current Plan'
            ) : currentPlan === 'agency' ? (
              'Downgrade to Pro'
            ) : (
              'Upgrade to Pro'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Agency Plan */}
      <Card className={cn(
        "relative",
        currentPlan === 'agency' && "ring-2 ring-primary"
      )}>
        {currentPlan === 'agency' && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Agency
          </CardTitle>
          <CardDescription>For teams and agencies</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">₦{PLANS.agency.price.toLocaleString()}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {PLANS.agency.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant={currentPlan === 'agency' ? 'outline' : 'default'}
            disabled={currentPlan === 'agency' || processingPayment}
            onClick={() => initializePayment('agency')}
          >
            {processingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentPlan === 'agency' ? (
              'Current Plan'
            ) : (
              'Upgrade to Agency'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
