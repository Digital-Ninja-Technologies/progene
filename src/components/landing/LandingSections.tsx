import { FileText, Zap, Clock, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Clock,
    title: "Save Hours",
    description: "Generate professional proposals in under 5 minutes, not hours.",
  },
  {
    icon: DollarSign,
    title: "Price Accurately",
    description: "Smart pricing engine accounts for complexity, urgency, and integrations.",
  },
  {
    icon: FileText,
    title: "Export Anywhere",
    description: "PDF, clipboard, or email-ready formats for any workflow.",
  },
  {
    icon: Zap,
    title: "Prevent Scope Creep",
    description: "Crystal clear deliverables keep projects on track.",
  },
];

const projectTypes = [
  "Framer Landing Pages",
  "Framer Marketing Sites",
  "WordPress Blogs",
  "WordPress Business Sites",
  "WordPress E-commerce",
  "WordPress Membership Sites",
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground animate-fade-in-up">
            <Zap className="h-4 w-4" />
            <span>For WordPress & Framer Developers</span>
          </div>

          {/* Headline - Framer style */}
          <h1 className="mb-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in-up [animation-delay:100ms]">
            Generate client-ready
            <span className="block text-muted-foreground">proposals, faster</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground animate-fade-in-up [animation-delay:200ms]">
            Stop underpricing. Stop scope creep. ScopeGen helps freelancers create 
            accurate pricing, clear deliverables, and professional proposals—fast.
          </p>

          {/* CTAs - Framer pill button style */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up [animation-delay:300ms]">
            <Button variant="pill" size="lg" asChild>
              <Link to="/wizard">
                Start for free
              </Link>
            </Button>
            <Button variant="pill-outline" size="lg" asChild>
              <Link to="/wizard">
                See how it works
              </Link>
            </Button>
          </div>

          {/* Social proof hint */}
          <p className="mt-10 text-sm text-muted-foreground animate-fade-in-up [animation-delay:400ms]">
            3 free proposals • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section className="py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-6">
            Everything you need to<br />price projects right
          </h2>
          <p className="text-lg text-muted-foreground">
            Built specifically for WordPress and Framer developers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-8 hover:bg-muted/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingProjectTypes() {
  return (
    <section className="py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-6">
              Tailored pricing for<br />every project type
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Whether you're building a simple landing page or a complex e-commerce site, 
              ScopeGen understands the nuances and calculates accurate estimates.
            </p>

            <ul className="space-y-4 mb-10">
              {projectTypes.map((type) => (
                <li key={type} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{type}</span>
                </li>
              ))}
            </ul>

            <Button variant="pill" size="lg" asChild>
              <Link to="/wizard">
                Try it now — free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="glass-card p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Project Type</span>
                  <span className="font-medium">WordPress E-commerce</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Number of Pages</span>
                  <span className="font-medium">12 pages</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Integrations</span>
                  <span className="font-medium">Stripe, Mailchimp</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Timeline</span>
                  <span className="font-medium">Urgent (2 weeks)</span>
                </div>
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Estimated Price</span>
                    <div className="text-right">
                      <span className="text-4xl font-semibold">$8,500</span>
                      <p className="text-sm text-muted-foreground">~68 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingCTA() {
  return (
    <section className="py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="glass-card overflow-hidden">
          <div className="p-12 lg:p-20 text-center relative">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Ready to price projects<br />with confidence?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-12">
              Join freelancers and agencies who've stopped underpricing their work. 
              Start with 3 free proposals—no credit card required.
            </p>
            <Button variant="pill" size="xl" asChild>
              <Link to="/wizard">
                Generate your first proposal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <FileText className="h-4 w-4 text-background" />
            </div>
            <span className="text-lg font-semibold">ScopeGen</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ScopeGen. Built for developers who value their time.
          </p>
        </div>
      </div>
    </footer>
  );
}
