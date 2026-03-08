import { Header } from "@/components/layout/Header";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => {
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

            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-neutral max-w-none space-y-8">
              <section className="space-y-3">
                <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using ProGene, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. We reserve the right to update these terms at any time with notice provided through the platform.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">2. Account Registration</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must be at least 18 years old to use ProGene.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">3. Service Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ProGene provides tools for generating professional project proposals, managing clients, tracking time, and invoicing. Free accounts are limited to 3 proposals. Paid plans unlock unlimited proposals and additional features as described on our pricing page.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">4. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You retain full ownership of all proposals, client data, and content you create using ProGene. We retain ownership of the platform, its design, code, and branding. You grant us a limited license to host and display your content as necessary to provide the service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">5. Payments & Subscriptions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Paid subscriptions are billed monthly or annually as selected. You may cancel at any time; access continues until the end of the billing period. Refunds are handled on a case-by-case basis. Prices may change with 30 days' notice.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">6. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may not use ProGene for unlawful purposes, to transmit malicious code, to impersonate others, or to interfere with the platform's operation. We reserve the right to suspend accounts that violate these terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ProGene is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold">8. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions about these terms? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
                </p>
              </section>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
