import { lazy, Suspense } from "react";
import { ClerkProvider } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { CookieConsent } from "@/components/CookieConsent";
import Index from "./pages/Index";

const WizardPage = lazy(() => import("./pages/WizardPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProposalViewPage = lazy(() => import("./pages/ProposalViewPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PublicProposalPage = lazy(() => import("./pages/PublicProposalPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const CoverLetterPage = lazy(() => import("./pages/CoverLetterPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingTour />
          <CookieConsent />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/wizard" element={<WizardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/proposal/:id" element={<ProposalViewPage />} />
              <Route path="/p/:token" element={<PublicProposalPage />} />
              <Route path="/cover-letter" element={<CoverLetterPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ClerkProvider>
);

export default App;
