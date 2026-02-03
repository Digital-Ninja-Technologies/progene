import { Header } from "@/components/layout/Header";
import {
  LandingHero,
  LandingFeatures,
  LandingProjectTypes,
  LandingCTA,
  LandingFooter,
} from "@/components/landing/LandingSections";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingProjectTypes />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
