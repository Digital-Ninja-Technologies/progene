import { INTEGRATIONS } from "@/types/project";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, Wrench, Check } from "lucide-react";

interface IntegrationsStepProps {
  selectedIntegrations: string[];
  animations: boolean;
  urgency: 'normal' | 'fast' | 'urgent';
  maintenance: boolean;
  onToggleIntegration: (id: string) => void;
  onAnimationsChange: (animations: boolean) => void;
  onUrgencyChange: (urgency: 'normal' | 'fast' | 'urgent') => void;
  onMaintenanceChange: (maintenance: boolean) => void;
}

const urgencyOptions = [
  { value: 'normal' as const, label: 'Normal', description: 'Standard timeline', icon: '📅' },
  { value: 'fast' as const, label: 'Fast', description: '+25% rush fee', icon: '⚡' },
  { value: 'urgent' as const, label: 'Urgent', description: '+50% rush fee', icon: '🚀' },
];

export function IntegrationsStep({
  selectedIntegrations,
  animations,
  urgency,
  maintenance,
  onToggleIntegration,
  onAnimationsChange,
  onUrgencyChange,
  onMaintenanceChange,
}: IntegrationsStepProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold sm:text-3xl mb-3">
          Integrations & features
        </h2>
        <p className="text-muted-foreground">
          What additional features does the project need?
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="glass-card p-6">
        <Label className="text-base font-medium mb-4 block">Third-Party Integrations</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATIONS.map((integration) => (
            <button
              key={integration.id}
              onClick={() => onToggleIntegration(integration.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                selectedIntegrations.includes(integration.id)
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-foreground/50"
              )}
            >
              <span className="font-medium">{integration.label}</span>
              <div
                className={cn(
                  "h-5 w-5 rounded-full border transition-all duration-200 flex items-center justify-center",
                  selectedIntegrations.includes(integration.id)
                    ? "border-foreground bg-foreground"
                    : "border-muted-foreground"
                )}
              >
                {selectedIntegrations.includes(integration.id) && (
                  <Check className="h-3 w-3 text-background" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Animations Toggle */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label className="text-base font-medium">Custom Animations</Label>
              <p className="text-sm text-muted-foreground">
                Smooth transitions, scroll effects, micro-interactions
              </p>
            </div>
          </div>
          <Switch checked={animations} onCheckedChange={onAnimationsChange} />
        </div>
      </div>

      {/* Urgency Selection */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">Timeline Urgency</Label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {urgencyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUrgencyChange(option.value)}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl border transition-all duration-200",
                urgency === option.value
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-foreground/50"
              )}
            >
              <span className="text-2xl mb-2">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Toggle */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label className="text-base font-medium">Ongoing Maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Client interested in monthly support retainer?
              </p>
            </div>
          </div>
          <Switch checked={maintenance} onCheckedChange={onMaintenanceChange} />
        </div>
      </div>
    </div>
  );
}
