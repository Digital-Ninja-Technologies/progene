import { Header } from "@/components/layout/Header";
import {
  LandingHero,
  LandingPainPoints,
  LandingFeatures,
  LandingStats,
  LandingHowItWorks,
  LandingProjectTypes,
  LandingTestimonials,
  LandingCTA,
  LandingFooter,
} from "@/components/landing/LandingSections";

const Index = () => {
  return (
    <div className="min-h-screen pt-14">
      <Header />
      <main>
        <LandingHero />
        <LandingPainPoints />
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingProjectTypes />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
