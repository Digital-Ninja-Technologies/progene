import { Header } from "@/components/layout/Header";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import {
  LandingHero,
  LandingPainPoints,
  LandingFeatures,
  LandingStats,
  LandingHowItWorks,
  LandingProjectTypes,
  LandingVideo,
  LandingTestimonials,
  LandingPricing,
  LandingFAQ,
  LandingCTA,
  LandingFooter,
} from "@/components/landing/LandingSections";
import { LandingROICalculator } from "@/components/landing/ROICalculator";

const Index = () => {
  useEffect(() => {
    const prefetch = () => {
      import("./WizardPage");
      import("./DashboardPage");
      import("./AuthPage");
    };
    const w = window as any;
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(prefetch, { timeout: 2500 })
      : window.setTimeout(prefetch, 1500);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>ProGene — Professional Proposals in Minutes</title>
        <meta name="description" content="ProGene helps freelancers create accurately-priced, professional client proposals in under 5 minutes — with a smart pricing engine, AI scope writer, and e-signature." />
        <link rel="canonical" href="https://progene.lovable.app/" />
        <meta property="og:title" content="ProGene — Professional Proposals in Minutes" />
        <meta property="og:description" content="Create accurately-priced, professional client proposals in under 5 minutes with ProGene." />
        <meta property="og:url" content="https://progene.lovable.app/" />
      </Helmet>
      <Header />
      <main>
        <LandingHero />
        <LandingPainPoints />
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingROICalculator />
        <LandingProjectTypes />
        <LandingVideo />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
