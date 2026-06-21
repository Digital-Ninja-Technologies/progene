import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface TourStep {
  title: string;
  description: string;
  targetSelector?: string;
  route?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to ProGene 👋",
    description: "ProGene helps you turn client questions into a ready-to-send proposal — with pricing, scope, and timeline already filled in. Let's walk through it in 60 seconds.",
    position: "center",
  },
  {
    title: "How it works — in plain English",
    description: "1) Pick the kind of work you do.  2) Tell us your hourly rate.  3) Answer a few quick questions about the project.  4) We generate the proposal. You edit anything you want before sending.",
    position: "center",
  },
  {
    title: "Start a Proposal",
    description: "This is the proposal wizard. There's no jargon — just simple questions about the project. You can save and come back any time.",
    route: "/wizard",
    position: "center",
  },
  {
    title: "Your Dashboard",
    description: "Every proposal you create lives here. Track which clients viewed and signed, manage contacts, and see how your business is doing at a glance.",
    route: "/dashboard",
    position: "center",
  },
  {
    title: "Make it yours",
    description: "Add your logo, brand colors, and company details in Settings. Every proposal you send will use them automatically.",
    route: "/settings",
    position: "center",
  },
  {
    title: "You're all set 🚀",
    description: "You've got 3 free proposals to try things out — no credit card needed. Upgrade only when you're ready. Let's create your first one!",
    position: "center",
  },
];

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("progene_tour_completed");
    const isNewUser = localStorage.getItem("progene_show_tour");
    if (isNewUser === "true" && !hasSeenTour) {
      // Small delay for page to render
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem("progene_tour_completed", "true");
    localStorage.removeItem("progene_show_tour");
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (tourSteps[next].route && location.pathname !== tourSteps[next].route) {
        navigate(tourSteps[next].route!);
      }
    } else {
      completeTour();
      navigate("/wizard");
    }
  }, [currentStep, completeTour, navigate, location.pathname]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (tourSteps[prev].route && location.pathname !== tourSteps[prev].route) {
        navigate(tourSteps[prev].route!);
      }
    }
  }, [currentStep, navigate, location.pathname]);

  if (!isActive) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[100]" onClick={completeTour} />

      {/* Tooltip */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl animate-scale-in">
          {/* Close button */}
          <button onClick={completeTour} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "w-8 bg-primary" : i < currentStep ? "w-4 bg-primary/40" : "w-4 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 0 ? (
                <Button variant="ghost" size="sm" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={completeTour} className="text-muted-foreground">
                  Skip tour
                </Button>
              )}
            </div>
            <Button onClick={nextStep} className="rounded-full">
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create First Proposal
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Trigger tour for new users - call this after signup
export function triggerOnboardingTour() {
  localStorage.setItem("progene_show_tour", "true");
  localStorage.removeItem("progene_tour_completed");
}

// Manually restart the tour (e.g. from a "Take a tour" button)
export function restartOnboardingTour() {
  localStorage.setItem("progene_show_tour", "true");
  localStorage.removeItem("progene_tour_completed");
  // Force a reload so the tour mounts and triggers from step 0
  window.location.reload();
}
