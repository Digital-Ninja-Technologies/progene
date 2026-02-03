import { INTEGRATIONS } from "@/types/project";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sparkles, Clock, Wrench } from "lucide-react";

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
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl mb-2">
          Integrations & Features
        </h2>
        <p className="text-muted-foreground">
          What additional features does the project need?
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="glass-card p-6">
        <Label className="text-lg font-medium mb-4 block">Third-Party Integrations</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATIONS.map((integration) => (
            <button
              key={integration.id}
              onClick={() => onToggleIntegration(integration.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200",
                selectedIntegrations.includes(integration.id)
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              )}
            >
              <span className="font-medium">{integration.label}</span>
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                  selectedIntegrations.includes(integration.id)
                    ? "border-accent bg-accent"
                    : "border-muted-foreground"
                )}
              >
                {selectedIntegrations.includes(integration.id) && (
                  <svg
                    className="h-3 w-3 text-accent-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
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
            <Sparkles className="h-5 w-5 text-accent" />
            <div>
              <Label className="text-lg font-medium">Custom Animations</Label>
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
          <Clock className="h-5 w-5 text-accent" />
          <Label className="text-lg font-medium">Timeline Urgency</Label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {urgencyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUrgencyChange(option.value)}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
                urgency === option.value
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              )}
            >
              <span className="text-2xl mb-2">{option.icon}</span>
              <span className="font-semibold">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Toggle */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-accent" />
            <div>
              <Label className="text-lg font-medium">Ongoing Maintenance</Label>
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
