import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { StepIndicator } from "@/components/wizard/StepIndicator";
import { ProjectTypeStep } from "@/components/wizard/ProjectTypeStep";
import { ProjectDetailsStep } from "@/components/wizard/ProjectDetailsStep";
import { IntegrationsStep } from "@/components/wizard/IntegrationsStep";
import { PricingStep } from "@/components/wizard/PricingStep";
import { ProposalPreview } from "@/components/wizard/ProposalPreview";
import { LivePricingSidebar } from "@/components/wizard/LivePricingSidebar";
import { useWizard } from "@/hooks/useWizard";

const stepLabels = [
  "Project Type",
  "Details",
  "Features",
  "Pricing",
  "Proposal",
];

export default function WizardPage() {
  const {
    step,
    totalSteps,
    config,
    pricing,
    proposal,
    canProceed,
    updateConfig,
    toggleIntegration,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
  } = useWizard();

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ProjectTypeStep
            selectedType={config.type}
            onSelect={(type) => updateConfig("type", type)}
          />
        );
      case 2:
        return (
          <ProjectDetailsStep
            pages={config.pages}
            cmsNeeded={config.cmsNeeded}
            onPagesChange={(pages) => updateConfig("pages", pages)}
            onCmsChange={(cmsNeeded) => updateConfig("cmsNeeded", cmsNeeded)}
          />
        );
      case 3:
        return (
          <IntegrationsStep
            selectedIntegrations={config.integrations}
            animations={config.animations}
            urgency={config.urgency}
            maintenance={config.maintenance}
            onToggleIntegration={toggleIntegration}
            onAnimationsChange={(animations) =>
              updateConfig("animations", animations)
            }
            onUrgencyChange={(urgency) => updateConfig("urgency", urgency)}
            onMaintenanceChange={(maintenance) =>
              updateConfig("maintenance", maintenance)
            }
          />
        );
      case 4:
        return (
          <PricingStep
            hourlyRate={config.hourlyRate}
            currency={config.currency}
            onRateChange={(rate) => updateConfig("hourlyRate", rate)}
            onCurrencyChange={(currency) => updateConfig("currency", currency)}
          />
        );
      case 5:
        return <ProposalPreview proposal={proposal} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-14">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <StepIndicator
            currentStep={step}
            totalSteps={totalSteps}
            stepLabels={stepLabels}
            onStepClick={goToStep}
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Wizard Content */}
          <div className="wizard-card min-h-[500px]">
            {renderStep()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <div>
                {step > 1 && (
                  <Button
                    variant="wizard"
                    onClick={prevStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {step === totalSteps ? (
                  <Button variant="pill-outline" onClick={resetWizard}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                ) : (
                  <Button
                    variant="wizard-primary"
                    onClick={nextStep}
                    disabled={!canProceed}
                  >
                    {step === totalSteps - 1 ? "Generate Proposal" : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Live Pricing Sidebar */}
          <div className="hidden lg:block">
            <LivePricingSidebar config={config} pricing={pricing} />
          </div>
        </div>

        {/* Mobile Pricing Summary */}
        <div className="lg:hidden mt-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Price</p>
                <p className="text-2xl font-semibold">
                  {config.type
                    ? `$${pricing.recommendedPrice.toLocaleString()}`
                    : "--"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Hours</p>
                <p className="text-lg font-semibold">
                  {config.type ? `${pricing.estimatedHours}h` : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
