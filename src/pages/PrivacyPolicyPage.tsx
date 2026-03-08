import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyPage = () => {
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

            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-neutral max-w-none space-y-8">
              <section className="space-y-3">
                <h2 className="text-xl font-bold">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information you provide directly, including your name, email address, company name, and payment information when you create an account or subscribe to our services. We also collect usage data such as proposals created, features used, and interaction patterns to improve our service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use your information to provide and improve ProGene's services, process payments, send service-related communications, and personalize your experience. We may also use aggregated, anonymized data for analytics and product development.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">3. Data Storage & Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is stored securely using industry-standard encryption. We use secure cloud infrastructure with regular backups. Proposal data, client information, and branding assets are encrypted at rest and in transit.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">4. Data Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal data. We may share data with trusted service providers who assist in operating our platform (e.g., payment processors, cloud hosting). Public proposals shared via link are accessible to anyone with that link.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">5. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, update, or delete your personal data at any time through your account settings. You can request a full export of your data or permanently delete your account and all associated data.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">6. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use essential cookies for authentication and session management. For more details, please see our <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">7. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
                </p>
              </section>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
