import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw, Loader2, Lock } from "lucide-react";
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
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const stepLabels = [
  "Project Type",
  "Pricing",
  "Details",
  "Features",
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
    isSaving,
    savedProposalId,
    updateConfig,
    toggleIntegration,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    saveProposal,
  } = useWizard();

  const { user, loading, canCreateProposal, getRemainingProposals, profile } = useAuthContext();
  const navigate = useNavigate();
  const [proposalSaved, setProposalSaved] = useState(false);

  // Handle step 5 transition - save proposal when reaching it
  useEffect(() => {
    if (step === 5 && user && !proposalSaved && canCreateProposal()) {
      saveProposal(proposal).then(({ error }) => {
        if (!error) {
          setProposalSaved(true);
        }
      });
    }
  }, [step, user, proposalSaved, proposal, saveProposal, canCreateProposal]);

  // Reset saved state when starting over
  const handleReset = () => {
    setProposalSaved(false);
    resetWizard();
  };

  const handleNextStep = () => {
    // Check if user can proceed to proposal step
    if (step === 4 && !user) {
      navigate('/auth');
      return;
    }
    
    if (step === 4 && !canCreateProposal()) {
      // User has used all free proposals
      return;
    }
    
    nextStep();
  };

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
          <PricingStep
            hourlyRate={config.hourlyRate}
            currency={config.currency}
            onRateChange={(rate) => updateConfig("hourlyRate", rate)}
            onCurrencyChange={(currency) => updateConfig("currency", currency)}
          />
        );
      case 3:
        return (
          <ProjectDetailsStep
            pages={config.pages}
            cmsNeeded={config.cmsNeeded}
            onPagesChange={(pages) => updateConfig("pages", pages)}
            onCmsChange={(cmsNeeded) => updateConfig("cmsNeeded", cmsNeeded)}
          />
        );
      case 4:
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
      case 5:
        return <ProposalPreview proposal={proposal} proposalId={savedProposalId || undefined} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const remaining = getRemainingProposals();
  const canGenerate = canCreateProposal();

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
                  <Button variant="pill-outline" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                ) : step === 4 ? (
                  // Special handling for step 4 -> 5 transition
                  !user ? (
                    <Button
                      variant="wizard-primary"
                      onClick={() => navigate('/auth')}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Sign in to Generate
                    </Button>
                  ) : !canGenerate ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-destructive">
                        No free proposals remaining
                      </span>
                      <Button variant="wizard-primary" disabled>
                        Upgrade to Pro
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="wizard-primary"
                      onClick={handleNextStep}
                      disabled={!canProceed || isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Generate Proposal ({remaining} left)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )
                ) : (
                  <Button
                    variant="wizard-primary"
                    onClick={handleNextStep}
                    disabled={!canProceed}
                  >
                    Continue
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
