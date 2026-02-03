import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <button
              onClick={() => onStepClick?.(step)}
              disabled={step > currentStep}
              className={cn(
                "flex items-center gap-3 transition-all duration-200",
                step <= currentStep && "cursor-pointer",
                step > currentStep && "cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300",
                  step < currentStep && "step-completed border-transparent",
                  step === currentStep && "step-active border-transparent shadow-glow",
                  step > currentStep && "step-pending border-border"
                )}
              >
                {step < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  step === currentStep && "text-foreground",
                  step !== currentStep && "text-muted-foreground"
                )}
              >
                {stepLabels[index]}
              </span>
            </button>
            {index < totalSteps - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={cn(
                    "h-0.5 rounded-full transition-all duration-300",
                    step < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {stepLabels[currentStep - 1]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                step < currentStep && "bg-primary",
                step === currentStep && "accent-gradient",
                step > currentStep && "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
