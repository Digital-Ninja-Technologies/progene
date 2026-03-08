import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="w-[90%] max-w-3xl mx-auto">
          <ScrollReveal>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Cookie Policy</h1>
            <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-neutral max-w-none space-y-8">
              <section className="space-y-3">
                <h2 className="text-xl font-bold">1. What Are Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your browsing experience.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">2. Essential Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These cookies are necessary for ProGene to function properly. They handle authentication, session management, and security. You cannot opt out of essential cookies as the service requires them.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="font-medium">sb-access-token</span><span className="text-muted-foreground">Authentication</span></div>
                  <div className="flex justify-between"><span className="font-medium">sb-refresh-token</span><span className="text-muted-foreground">Session renewal</span></div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">3. Functional Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These cookies remember your preferences like theme settings, onboarding progress, and UI state. They improve your experience but are not strictly required.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="font-medium">progene_show_tour</span><span className="text-muted-foreground">Onboarding state</span></div>
                  <div className="flex justify-between"><span className="font-medium">progene_tour_completed</span><span className="text-muted-foreground">Tour completion</span></div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">4. Analytics Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may use analytics cookies to understand how visitors interact with ProGene. This data is aggregated and anonymized. We do not use third-party advertising cookies.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">5. Managing Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can control cookies through your browser settings. Disabling essential cookies may prevent ProGene from functioning correctly. Most browsers allow you to block or delete cookies.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">6. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions about our cookie practices? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
                </p>
              </section>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicyPage;
