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
    title: "Welcome to ProGene! 🎉",
    description: "Let's take a quick tour to show you how to create your first professional proposal in under 5 minutes.",
    position: "center",
  },
  {
    title: "Create a Proposal",
    description: "Start by clicking here to open the proposal wizard. You'll choose your project type, set pricing, and configure features.",
    route: "/wizard",
    position: "center",
  },
  {
    title: "Your Dashboard",
    description: "View all your proposals, track analytics, manage clients, and more from your personal dashboard.",
    route: "/dashboard",
    position: "center",
  },
  {
    title: "Settings & Branding",
    description: "Customize your proposals with your brand colors, logo, and company details in Settings.",
    route: "/settings",
    position: "center",
  },
  {
    title: "You're all set! 🚀",
    description: "You have 3 free proposals to get started. Create your first one now and win that client!",
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
