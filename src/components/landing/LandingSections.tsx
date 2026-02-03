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
  "Webflow Landing Pages",
  "Webflow Marketing Sites",
  "Webflow E-commerce",
  "Shopify Theme Customization",
  "Shopify Custom Stores",
  "Shopify Plus Enterprise",
  "WordPress Blogs",
  "WordPress Business Sites",
  "WordPress E-commerce",
  "WordPress Membership Sites",
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Dojah-style gradient background */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      
      {/* Decorative curved lines - Dojah style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full border border-primary/10" />
        <div className="absolute top-1/3 right-20 w-[400px] h-[400px] rounded-full border border-primary/5" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-2 text-sm text-primary animate-fade-in-up">
              <Zap className="h-4 w-4" />
              <span>For WordPress & Framer Developers</span>
            </div>

            {/* Headline - Dojah style with colored words */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in-up [animation-delay:100ms]">
              <span className="text-gradient">Smart pricing</span>
              <span className="block text-foreground">infrastructure for</span>
              <span className="block text-foreground">freelancers</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-12 max-w-lg text-lg text-muted-foreground animate-fade-in-up [animation-delay:200ms]">
              Build accurate proposals and scope documents in minutes. Our smart technology 
              helps developers of all sizes price projects confidently.
            </p>

            {/* CTAs - Dojah style with outline + filled */}
            <div className="flex flex-col items-start gap-4 sm:flex-row animate-fade-in-up [animation-delay:300ms]">
              <Button variant="outline" size="lg" className="rounded-lg" asChild>
                <Link to="/wizard">
                  Get Started
                </Link>
              </Button>
              <Button size="lg" className="rounded-lg" asChild>
                <Link to="/wizard">
                  Talk to sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero visual - Dojah style floating cards */}
          <div className="relative hidden lg:block animate-fade-in-up [animation-delay:400ms]">
            <div className="relative">
              {/* Main card */}
              <div className="glass-card p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Proposal Generated</p>
                    <p className="text-sm text-muted-foreground">WordPress E-commerce</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-success ml-auto" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Hours</span>
                    <span className="font-medium">68h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Project Value</span>
                    <span className="font-semibold text-2xl">$8,500</span>
                  </div>
                </div>
              </div>

              {/* Floating card - top right */}
              <div className="absolute -top-8 -right-8 glass-card p-4 shadow-lg animate-fade-in-up [animation-delay:500ms]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Scope</p>
                    <p className="text-sm font-medium">Verified</p>
                  </div>
                </div>
              </div>

              {/* Floating card - bottom left */}
              <div className="absolute -bottom-4 -left-8 glass-card p-4 shadow-lg animate-fade-in-up [animation-delay:600ms]">
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Complexity</p>
                    <p className="font-semibold text-primary">Medium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof - Dojah style logo strip */}
        <div className="mt-20 pt-12 border-t border-border/50 animate-fade-in-up [animation-delay:500ms]">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by freelancers and agencies worldwide
          </p>
          <div className="flex items-center justify-center gap-12 opacity-50">
            <span className="text-xl font-semibold text-muted-foreground">WordPress</span>
            <span className="text-xl font-semibold text-muted-foreground">Framer</span>
            <span className="text-xl font-semibold text-muted-foreground">Webflow</span>
            <span className="text-xl font-semibold text-muted-foreground">Shopify</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <p className="text-primary font-medium mb-4">Why ScopeGen?</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
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
              className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <feature.icon className="h-5 w-5 text-primary" />
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
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <p className="text-primary font-medium mb-4">Project Types</p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Tailored pricing for<br />every project type
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Whether you're building a simple landing page or a complex e-commerce site, 
              ScopeGen understands the nuances and calculates accurate estimates.
            </p>

            <ul className="space-y-4 mb-10">
              {projectTypes.map((type) => (
                <li key={type} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  </div>
                  <span className="text-foreground">{type}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="rounded-lg" asChild>
              <Link to="/wizard">
                Try it now — free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="glass-card p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Project Estimate</p>
                  <p className="text-xs text-muted-foreground">Generated in 3 minutes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Project Type</span>
                  <span className="font-medium bg-accent text-primary px-3 py-1 rounded-full text-sm">WordPress E-commerce</span>
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
                  <span className="font-medium text-warning">Urgent (2 weeks)</span>
                </div>
                <div className="pt-4 bg-accent -mx-8 -mb-8 p-8 rounded-b-2xl mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Estimated Price</span>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-primary">$8,500</span>
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
    <section className="py-24 lg:py-32 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-primary-foreground">
            Ready to price projects<br />with confidence?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80 mb-12">
            Join freelancers and agencies who've stopped underpricing their work. 
            Start with 2 free proposals—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="secondary" size="xl" className="rounded-lg" asChild>
              <Link to="/wizard">
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="rounded-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/wizard">
                Talk to sales
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
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
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
