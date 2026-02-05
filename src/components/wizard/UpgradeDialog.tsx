import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proFeatures = [
  "Unlimited proposals",
  "Custom branding",
  "Priority support",
  "Advanced analytics",
];

const agencyFeatures = [
  "Everything in Pro",
  "Team collaboration",
  "White-label exports",
  "Dedicated account manager",
];

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = (plan: "pro" | "agency") => {
    onOpenChange(false);
    navigate("/settings?tab=billing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">You've Used All Free Proposals</DialogTitle>
          <DialogDescription className="text-base">
            You've created 3 proposals on the free plan. Upgrade to continue creating unlimited professional proposals.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 sm:grid-cols-2">
          {/* Pro Plan */}
          <div className="rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Pro</h3>
            </div>
            <p className="text-2xl font-bold mb-1">
              $15<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-xs text-muted-foreground mb-4 line-through">$25/mo</p>
            <ul className="space-y-2 mb-4">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleUpgrade("pro")}
            >
              Upgrade to Pro
            </Button>
          </div>

          {/* Agency Plan */}
          <div className="rounded-lg border-2 border-primary p-4 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              Popular
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Agency</h3>
            </div>
            <p className="text-2xl font-bold mb-1">
              $35<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-xs text-muted-foreground mb-4 line-through">$45/mo</p>
            <ul className="space-y-2 mb-4">
              {agencyFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              className="w-full"
              onClick={() => handleUpgrade("agency")}
            >
              Upgrade to Agency
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          🔒 Price locked forever for early subscribers
        </p>
      </DialogContent>
    </Dialog>
  );
}
