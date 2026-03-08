import { Header } from "@/components/layout/Header";
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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <LandingHero />
        <LandingPainPoints />
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
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
