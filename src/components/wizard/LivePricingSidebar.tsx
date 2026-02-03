import { PricingResult, ProjectConfig, PROJECT_TYPES, CURRENCIES } from "@/types/project";

interface LivePricingSidebarProps {
  config: ProjectConfig;
  pricing: PricingResult;
}

export function LivePricingSidebar({ config, pricing }: LivePricingSidebarProps) {
  const projectTypeLabel = config.type
    ? PROJECT_TYPES.find((p) => p.value === config.type)?.label
    : 'Select project type';
  const currencySymbol =
    CURRENCIES.find((c) => c.value === config.currency)?.symbol || '$';

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const complexityColors = {
    Simple: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Complex: 'bg-orange-500',
    Enterprise: 'bg-red-500',
  };

  return (
    <div className="glass-card p-6 sticky top-24">
      <h3 className="font-display text-lg font-semibold mb-6">Live Estimate</h3>

      {/* Project Summary */}
      <div className="space-y-4 mb-6 pb-6 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Project Type</span>
          <span className="font-medium text-right max-w-[150px] truncate">
            {projectTypeLabel}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pages</span>
          <span className="font-medium">{config.pages}</span>
        </div>
        {config.cmsNeeded && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CMS</span>
            <span className="font-medium text-accent">Included</span>
          </div>
        )}
        {config.integrations.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Integrations</span>
            <span className="font-medium">{config.integrations.length}</span>
          </div>
        )}
        {config.animations && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Animations</span>
            <span className="font-medium text-accent">Included</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Urgency</span>
          <span className="font-medium capitalize">{config.urgency}</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4 mb-6">
        <div className="text-center p-4 rounded-xl bg-accent/10">
          <p className="text-sm text-muted-foreground mb-1">Recommended Price</p>
          <p className="text-3xl font-bold text-gradient-accent">
            {config.type ? formatCurrency(pricing.recommendedPrice) : '--'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Min</p>
            <p className="text-lg font-semibold">
              {config.type ? formatCurrency(pricing.minPrice) : '--'}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Premium</p>
            <p className="text-lg font-semibold">
              {config.type ? formatCurrency(pricing.premiumPrice) : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 pt-6 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Est. Hours</span>
          <span className="font-semibold tabular-nums">
            {config.type ? `${pricing.estimatedHours}h` : '--'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Timeline</span>
          <span className="font-semibold">
            {config.type ? `${pricing.timelineWeeks} weeks` : '--'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Complexity</span>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                config.type ? complexityColors[pricing.complexityLevel] : 'bg-muted'
              }`}
            />
            <span className="font-semibold">
              {config.type ? pricing.complexityLevel : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Your Rate</span>
          <span className="font-semibold">
            {formatCurrency(config.hourlyRate)}/hr
          </span>
        </div>
      </div>
    </div>
  );
}
