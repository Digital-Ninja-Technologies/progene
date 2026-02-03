import { 
  FileText, 
  Zap, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Target,
  Shield,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";

const features = [
  {
    icon: Clock,
    title: "Save Hours",
    description: "Generate professional proposals in under 5 minutes, not hours.",
    color: "bg-[#36C5F0]/10 text-[#36C5F0]",
  },
  {
    icon: DollarSign,
    title: "Price Accurately",
    description: "Smart pricing engine accounts for complexity, urgency, and integrations.",
    color: "bg-[#2EB67D]/10 text-[#2EB67D]",
  },
  {
    icon: FileText,
    title: "Export Anywhere",
    description: "PDF, clipboard, or email-ready formats for any workflow.",
    color: "bg-[#ECB22E]/10 text-[#ECB22E]",
  },
  {
    icon: Zap,
    title: "Prevent Scope Creep",
    description: "Crystal clear deliverables keep projects on track.",
    color: "bg-[#E01E5A]/10 text-[#E01E5A]",
  },
];

const painPoints = [
  {
    icon: XCircle,
    title: "Spending 2+ hours on each proposal",
    description: "That's time you could spend actually building.",
  },
  {
    icon: AlertTriangle,
    title: "Guessing project prices",
    description: "Then regretting it halfway through when scope explodes.",
  },
  {
    icon: DollarSign,
    title: "Undercharging for your work",
    description: "Because you don't know what others are charging.",
  },
];

const solutions = [
  {
    icon: Rocket,
    title: "5-minute proposals",
    description: "Answer a few questions, get a complete proposal.",
  },
  {
    icon: Target,
    title: "Data-driven pricing",
    description: "Based on real market rates and project complexity.",
  },
  {
    icon: Shield,
    title: "Scope protection",
    description: "Clear deliverables that prevent scope creep.",
  },
];

const projectTypes = [
  { name: "Framer Landing Pages", color: "bg-[#36C5F0]" },
  { name: "Framer Marketing Sites", color: "bg-[#36C5F0]" },
  { name: "Webflow Landing Pages", color: "bg-[#2EB67D]" },
  { name: "Webflow Marketing Sites", color: "bg-[#2EB67D]" },
  { name: "Webflow E-commerce", color: "bg-[#2EB67D]" },
  { name: "Shopify Theme Customization", color: "bg-[#ECB22E]" },
  { name: "Shopify Custom Stores", color: "bg-[#ECB22E]" },
  { name: "Shopify Plus Enterprise", color: "bg-[#ECB22E]" },
  { name: "WordPress Blogs", color: "bg-[#E01E5A]" },
  { name: "WordPress Business Sites", color: "bg-[#E01E5A]" },
  { name: "WordPress E-commerce", color: "bg-[#E01E5A]" },
  { name: "WordPress Membership Sites", color: "bg-[#E01E5A]" },
];

const stats = [
  { value: "5 min", label: "Average time to create a proposal" },
  { value: "2,500+", label: "Proposals generated" },
  { value: "98%", label: "Client approval rate" },
];

// Decorative floating shapes component
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Blue circle */}
      <div className="absolute top-20 left-[10%] w-16 h-16 rounded-full bg-[#36C5F0]/20 animate-bounce" style={{ animationDuration: '3s' }} />
      {/* Green square */}
      <div className="absolute top-40 right-[15%] w-12 h-12 rounded-xl bg-[#2EB67D]/20 animate-pulse" />
      {/* Yellow triangle */}
      <div className="absolute bottom-32 left-[20%] w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-[#ECB22E]/30 animate-bounce" style={{ animationDuration: '4s' }} />
      {/* Pink circle */}
      <div className="absolute top-60 left-[5%] w-8 h-8 rounded-full bg-[#E01E5A]/20 animate-pulse" style={{ animationDuration: '2s' }} />
      {/* Large blurred shapes */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#36C5F0]/10 to-[#2EB67D]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#ECB22E]/10 to-[#E01E5A]/10 blur-3xl" />
    </div>
  );
}

// Illustration component for hero
function HeroIllustration() {
  return (
    <div className="relative">
      {/* Main proposal card */}
      <div className="glass-card p-6 shadow-xl relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#36C5F0] to-[#2EB67D] flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold">Proposal Generated</p>
            <p className="text-sm text-muted-foreground">WordPress E-commerce</p>
          </div>
          <CheckCircle2 className="h-6 w-6 text-[#2EB67D] ml-auto" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Hours</span>
            <span className="font-medium">68h</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-muted-foreground text-sm">Project Value</span>
            <span className="font-bold text-3xl bg-gradient-to-r from-[#2EB67D] to-[#36C5F0] bg-clip-text text-transparent">$8,500</span>
          </div>
        </div>
      </div>

      {/* Floating card - Sparkles */}
      <div className="absolute -top-6 -right-6 glass-card p-3 shadow-lg animate-bounce z-20" style={{ animationDuration: '2s' }}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ECB22E] to-[#E01E5A] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
      </div>

      {/* Floating card - Time saved */}
      <div className="absolute -bottom-4 -left-6 glass-card p-3 shadow-lg animate-pulse z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#36C5F0]/20 flex items-center justify-center">
            <Clock className="h-4 w-4 text-[#36C5F0]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time Saved</p>
            <p className="text-sm font-semibold text-[#36C5F0]">2+ hours</p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gradient-to-br from-[#36C5F0]/5 via-[#2EB67D]/5 to-[#ECB22E]/5" />
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <FloatingShapes />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#2EB67D]/30 bg-[#2EB67D]/10 px-4 py-2 text-sm text-[#2EB67D] font-medium animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              <span>Stop underpricing your work</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in-up [animation-delay:100ms]">
              <span className="bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] to-[#ECB22E] bg-clip-text text-transparent">Proposals</span>
              <span className="block text-foreground">that win clients,</span>
              <span className="block text-foreground">not headaches</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 max-w-lg text-lg text-muted-foreground animate-fade-in-up [animation-delay:200ms]">
              Tired of spending hours on proposals that don't convert? ScopeGen creates 
              professional, accurately-priced proposals in <span className="text-[#2EB67D] font-semibold">under 5 minutes</span>.
            </p>

            {/* Social proof mini */}
            <div className="flex items-center gap-4 mb-8 animate-fade-in-up [animation-delay:250ms]">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#36C5F0] border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-[#2EB67D] border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-[#ECB22E] border-2 border-background" />
                <div className="w-8 h-8 rounded-full bg-[#E01E5A] border-2 border-background" />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,500+</span> proposals created
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col items-start gap-4 sm:flex-row animate-fade-in-up [animation-delay:300ms]">
              <Button size="lg" className="rounded-full bg-gradient-to-r from-[#36C5F0] to-[#2EB67D] hover:opacity-90 shadow-lg shadow-[#36C5F0]/25" asChild>
                <Link to="/wizard">
                  Create Your First Proposal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link to="/wizard">
                  See How It Works
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block animate-fade-in-up [animation-delay:400ms]">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPainPoints() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-border" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E01E5A]/10 px-4 py-2 text-sm text-[#E01E5A] font-medium mb-6">
            <AlertTriangle className="h-4 w-4" />
            <span>Sound familiar?</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Freelancing is hard enough.
            <br />
            <span className="text-muted-foreground">Proposals shouldn't be.</span>
          </h2>
        </div>

        {/* Pain points vs Solutions */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Pain column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-[#E01E5A]/20 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-[#E01E5A]" />
              </div>
              <span className="font-semibold text-[#E01E5A]">Without ScopeGen</span>
            </div>
            {painPoints.map((point, index) => (
              <div
                key={point.title}
                className="bg-[#E01E5A]/5 border border-[#E01E5A]/20 rounded-2xl p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#E01E5A]/10 flex items-center justify-center flex-shrink-0">
                    <point.icon className="h-5 w-5 text-[#E01E5A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Solution column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-[#2EB67D]/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-[#2EB67D]" />
              </div>
              <span className="font-semibold text-[#2EB67D]">With ScopeGen</span>
            </div>
            {solutions.map((point, index) => (
              <div
                key={point.title}
                className="bg-[#2EB67D]/5 border border-[#2EB67D]/20 rounded-2xl p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100 + 300}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#2EB67D]/10 flex items-center justify-center flex-shrink-0">
                    <point.icon className="h-5 w-5 text-[#2EB67D]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#36C5F0]/10 px-4 py-2 text-sm text-[#36C5F0] font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Features</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-[#36C5F0] to-[#2EB67D] bg-clip-text text-transparent">price projects right</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built specifically for WordPress, Framer, Webflow, and Shopify developers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-background rounded-2xl p-8 border border-border hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} transition-transform group-hover:scale-110`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingStats() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] to-[#ECB22E]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center text-white animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <p className="text-5xl font-bold mb-2">{stat.value}</p>
              <p className="text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingProjectTypes() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ECB22E]/10 px-4 py-2 text-sm text-[#ECB22E] font-medium mb-6">
            <Target className="h-4 w-4" />
            <span>Project Types</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Tailored pricing for
            <br />
            <span className="bg-gradient-to-r from-[#ECB22E] to-[#E01E5A] bg-clip-text text-transparent">every project type</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're building a simple landing page or a complex e-commerce site, 
            ScopeGen understands the nuances and calculates accurate estimates.
          </p>
        </div>

        {/* Animated project type cards */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {projectTypes.map((type, index) => (
            <div
              key={type.name}
              className="group flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up cursor-default"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-2 h-2 rounded-full ${type.color}`} />
              <span className="text-sm font-medium">{type.name}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="rounded-full bg-gradient-to-r from-[#ECB22E] to-[#E01E5A] hover:opacity-90" asChild>
            <Link to="/wizard">
              Try it now — free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose your project type",
      description: "Select from WordPress, Framer, Webflow, or Shopify templates.",
      color: "from-[#36C5F0] to-[#36C5F0]",
    },
    {
      number: "02", 
      title: "Answer a few questions",
      description: "Pages, features, integrations, timeline — we ask, you answer.",
      color: "from-[#2EB67D] to-[#2EB67D]",
    },
    {
      number: "03",
      title: "Get your proposal",
      description: "Receive a complete, professional proposal with accurate pricing.",
      color: "from-[#ECB22E] to-[#ECB22E]",
    },
    {
      number: "04",
      title: "Win the client",
      description: "Send it off and close the deal with confidence.",
      color: "from-[#E01E5A] to-[#E01E5A]",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary font-medium mb-6">
            <Rocket className="h-4 w-4" />
            <span>How It Works</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            From zero to proposal
            <br />
            <span className="bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] via-[#ECB22E] to-[#E01E5A] bg-clip-text text-transparent">in 4 simple steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`text-6xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20 absolute top-4 right-4`}>
                {step.number}
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold mb-6`}>
                {step.number}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingCTA() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Colorful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#36C5F0] via-[#2EB67D] to-[#ECB22E]" />
      
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 rounded-full bg-white/5" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-white">
            Ready to stop guessing
            <br />
            and start winning?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/80 mb-12">
            Join thousands of freelancers who've stopped underpricing their work. 
            Start with <span className="font-semibold text-white">2 free proposals</span>—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full bg-white text-[#2EB67D] hover:bg-white/90 shadow-xl shadow-black/20" asChild>
              <Link to="/wizard">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur" asChild>
              <Link to="/wizard">
                Watch Demo
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
          <Logo size="md" />
          <p className="text-sm text-muted-foreground">
            © 2024 ScopeGen. Built for developers who value their time.
          </p>
        </div>
      </div>
    </footer>
  );
}
