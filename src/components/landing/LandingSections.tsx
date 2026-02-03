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
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="hero-gradient absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.1),transparent)]" />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground backdrop-blur-sm animate-fade-in-up">
            <Zap className="h-4 w-4" />
            <span>For WordPress & Framer Developers</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl animate-fade-in-up [animation-delay:100ms]">
            Generate Client-Ready
            <span className="block text-gradient-accent">Proposals in Minutes</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80 animate-fade-in-up [animation-delay:200ms]">
            Stop underpricing. Stop scope creep. ScopeGen helps freelancers and agencies create 
            accurate pricing, clear deliverables, and professional proposals—fast.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up [animation-delay:300ms]">
            <Button variant="accent" size="xl" asChild>
              <Link to="/wizard">
                Start Your First Proposal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/wizard">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Social proof hint */}
          <p className="mt-8 text-sm text-primary-foreground/60 animate-fade-in-up [animation-delay:400ms]">
            ✨ 3 free proposals • No credit card required
          </p>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 50L60 45.7C120 41.3 240 32.7 360 32.3C480 32 600 40 720 48.3C840 56.7 960 65.3 1080 65C1200 64.7 1320 55.3 1380 50.7L1440 46V101H1380C1320 101 1200 101 1080 101C960 101 840 101 720 101C600 101 480 101 360 101C240 101 120 101 60 101H0V50Z" fill="hsl(220 25% 97%)" />
        </svg>
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need to Price Projects Right
          </h2>
          <p className="text-lg text-muted-foreground">
            Built specifically for WordPress and Framer developers who want to save time and earn more.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl accent-gradient text-accent-foreground shadow-glow">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingProjectTypes() {
  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Tailored Pricing for Every Project Type
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're building a simple landing page or a complex e-commerce site, 
              ScopeGen understands the nuances and calculates accurate estimates.
            </p>

            <ul className="space-y-4">
              {projectTypes.map((type) => (
                <li key={type} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="font-medium">{type}</span>
                </li>
              ))}
            </ul>

            <Button variant="accent" size="lg" className="mt-8" asChild>
              <Link to="/wizard">
                Try It Now — It's Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="glass-card p-8 shadow-elevated">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Project Type</span>
                  <span className="font-semibold">WordPress E-commerce</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Number of Pages</span>
                  <span className="font-semibold">12 pages</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Integrations</span>
                  <span className="font-semibold">Stripe, Mailchimp</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Timeline</span>
                  <span className="font-semibold">Urgent (2 weeks)</span>
                </div>
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Estimated Price</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-gradient-accent">$8,500</span>
                      <p className="text-sm text-muted-foreground">~68 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingCTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="glass-card overflow-hidden">
          <div className="hero-gradient p-12 lg:p-16 text-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl mb-6">
                Ready to Price Projects
                <span className="block">With Confidence?</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80 mb-10">
                Join freelancers and agencies who've stopped underpricing their work. 
                Start with 3 free proposals—no credit card required.
              </p>
              <Button variant="accent" size="xl" asChild>
                <Link to="/wizard">
                  Generate Your First Proposal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-gradient">
              <FileText className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">ScopeGen</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ScopeGen. Built for developers who value their time.
          </p>
        </div>
      </div>
    </footer>
  );
}
