import { useState, useEffect } from "react";
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
  Rocket,
  Quote,
  Star,
  HelpCircle,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { ScrollReveal, StaggerContainer } from "@/components/animations/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Countdown Timer Component
function CountdownTimer() {
  // Set end date to 14 days from now (persisted via localStorage for consistency)
  const getEndDate = () => {
    const stored = localStorage.getItem('scopegen_launch_end');
    if (stored) {
      return new Date(stored);
    }
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    localStorage.setItem('scopegen_launch_end', endDate.toISOString());
    return endDate;
  };

  const [endDate] = useState(getEndDate);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="bg-gradient-to-br from-[#E01E5A] to-[#ECB22E] rounded-xl p-[2px]">
          <div className="bg-background rounded-[10px] w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#E01E5A] to-[#ECB22E] bg-clip-text text-transparent">
              {value.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#E01E5A]/20 to-[#ECB22E]/20 rounded-xl blur-lg -z-10 animate-pulse" />
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      <TimeBlock value={timeLeft.days} label="Days" />
      <div className="text-2xl font-bold text-muted-foreground self-start mt-5">:</div>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <div className="text-2xl font-bold text-muted-foreground self-start mt-5">:</div>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <div className="text-2xl font-bold text-muted-foreground self-start mt-5">:</div>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

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
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E01E5A]/10 px-4 py-2 text-sm text-[#E01E5A] font-medium mb-6">
            <AlertTriangle className="h-4 w-4" />
            <span>Sound familiar?</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Freelancing is hard enough.
            <br />
            <span className="text-muted-foreground">Proposals shouldn't be.</span>
          </h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Pain column */}
          <ScrollReveal direction="left" delay={100}>
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
                  className="bg-[#E01E5A]/5 border border-[#E01E5A]/20 rounded-2xl p-6"
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
          </ScrollReveal>

          {/* Solution column */}
          <ScrollReveal direction="right" delay={200}>
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
                  className="bg-[#2EB67D]/5 border border-[#2EB67D]/20 rounded-2xl p-6"
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
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto max-w-3xl text-center mb-20">
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
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" staggerDelay={100}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-background rounded-2xl p-8 border border-border hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} transition-transform group-hover:scale-110`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function LandingStats() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] to-[#ECB22E]">
      <div className="container mx-auto px-4">
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={150}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center text-white">
              <p className="text-5xl font-bold mb-2">{stat.value}</p>
              <p className="text-white/80">{stat.label}</p>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function LandingProjectTypes() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
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
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {projectTypes.map((type) => (
              <div
                key={type.name}
                className="group flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className={`w-2 h-2 rounded-full ${type.color}`} />
                <span className="text-sm font-medium">{type.name}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

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
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary font-medium mb-6">
            <Rocket className="h-4 w-4" />
            <span>How It Works</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            From zero to proposal
            <br />
            <span className="bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] via-[#ECB22E] to-[#E01E5A] bg-clip-text text-transparent">in 4 simple steps</span>
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" staggerDelay={100}>
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
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
        </StaggerContainer>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "I used to spend 3+ hours on every proposal. Now I'm done in 10 minutes and my close rate actually went UP. This thing pays for itself.",
    name: "Sarah Chen",
    role: "Freelance WordPress Developer",
    avatar: "SC",
    color: "from-[#36C5F0] to-[#2EB67D]",
    platform: "WordPress",
  },
  {
    quote: "Finally stopped undercharging for my Webflow projects. ScopeGen helped me realize I was leaving thousands on the table every month.",
    name: "Marcus Johnson",
    role: "Webflow Agency Owner",
    avatar: "MJ",
    color: "from-[#2EB67D] to-[#ECB22E]",
    platform: "Webflow",
  },
  {
    quote: "The scope documents are incredibly detailed. My clients actually read them now and we have way fewer 'that wasn't in the scope' conversations.",
    name: "Emily Rodriguez",
    role: "Framer Designer",
    avatar: "ER",
    color: "from-[#ECB22E] to-[#E01E5A]",
    platform: "Framer",
  },
  {
    quote: "Game changer for my Shopify agency. We've standardized our proposals across the team and everyone prices consistently now.",
    name: "David Park",
    role: "Shopify Plus Partner",
    avatar: "DP",
    color: "from-[#E01E5A] to-[#36C5F0]",
    platform: "Shopify",
  },
  {
    quote: "I was nervous about raising my rates. ScopeGen showed me exactly how to justify higher prices with detailed scope breakdowns. Clients actually respect it more.",
    name: "Jessica Williams",
    role: "Full-Stack Freelancer",
    avatar: "JW",
    color: "from-[#36C5F0] to-[#E01E5A]",
    platform: "WordPress",
  },
  {
    quote: "The best part? No more awkward pricing conversations. I just send the proposal and let ScopeGen do the talking.",
    name: "Alex Thompson",
    role: "Web Design Studio",
    avatar: "AT",
    color: "from-[#2EB67D] to-[#36C5F0]",
    platform: "Webflow",
  },
];

export function LandingTestimonials() {
  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[5%] w-64 h-64 rounded-full bg-[#36C5F0]/5 blur-3xl" />
        <div className="absolute bottom-20 right-[5%] w-80 h-80 rounded-full bg-[#E01E5A]/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E01E5A]/10 px-4 py-2 text-sm text-[#E01E5A] font-medium mb-6">
            <Users className="h-4 w-4" />
            <span>Loved by Freelancers</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Don't take our word for it.
            <br />
            <span className="bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] to-[#E01E5A] bg-clip-text text-transparent">Hear from real freelancers.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thousands of developers trust ScopeGen to price their projects accurately and win more clients.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" staggerDelay={100}>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              {/* Quote icon */}
              <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center shadow-lg`}>
                <Quote className="h-4 w-4 text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4 pt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#ECB22E] text-[#ECB22E]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}>
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {testimonial.platform}
                </div>
              </div>
            </div>
          ))}
        </StaggerContainer>

        {/* Bottom social proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-card rounded-full px-6 py-3 border border-border shadow-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#36C5F0] border-2 border-card flex items-center justify-center text-white text-xs font-semibold">S</div>
              <div className="w-8 h-8 rounded-full bg-[#2EB67D] border-2 border-card flex items-center justify-center text-white text-xs font-semibold">M</div>
              <div className="w-8 h-8 rounded-full bg-[#ECB22E] border-2 border-card flex items-center justify-center text-white text-xs font-semibold">E</div>
              <div className="w-8 h-8 rounded-full bg-[#E01E5A] border-2 border-card flex items-center justify-center text-white text-xs font-semibold">D</div>
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-card flex items-center justify-center text-white text-xs font-semibold">+</div>
            </div>
            <div className="text-sm">
              <span className="font-semibold">2,500+</span>
              <span className="text-muted-foreground"> freelancers trust ScopeGen</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for trying out ScopeGen",
    price: "$0",
    originalPrice: null,
    period: "forever",
    color: "border-border",
    buttonColor: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    buttonText: "Get Started Free",
    popular: false,
    launchDeal: false,
    features: [
      { text: "2 proposals included", included: true },
      { text: "All project types", included: true },
      { text: "Smart pricing engine", included: true },
      { text: "PDF export", included: true },
      { text: "Unlimited proposals", included: false },
      { text: "Priority support", included: false },
      { text: "Custom branding", included: false },
      { text: "Team collaboration", included: false },
    ],
  },
  {
    name: "Pro",
    description: "For busy freelancers",
    price: "$15",
    originalPrice: "$20",
    period: "/month",
    color: "border-[#2EB67D] ring-2 ring-[#2EB67D]/20",
    buttonColor: "bg-gradient-to-r from-[#36C5F0] to-[#2EB67D] hover:opacity-90 text-white",
    buttonText: "Lock In This Price",
    popular: true,
    launchDeal: true,
    features: [
      { text: "Unlimited proposals", included: true, highlight: true },
      { text: "All project types", included: true },
      { text: "Smart pricing engine", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding", included: true },
      { text: "Proposal analytics", included: true },
      { text: "Team collaboration", included: false },
    ],
  },
  {
    name: "Agency",
    description: "For teams and agencies",
    price: "$35",
    originalPrice: "$40",
    period: "/month",
    color: "border-[#E01E5A] ring-2 ring-[#E01E5A]/20",
    buttonColor: "bg-[#E01E5A] hover:bg-[#E01E5A]/90 text-white",
    buttonText: "Lock In This Price",
    popular: false,
    launchDeal: true,
    features: [
      { text: "Unlimited proposals", included: true, highlight: true },
      { text: "All project types", included: true },
      { text: "Smart pricing engine", included: true },
      { text: "PDF export", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding", included: true },
      { text: "Proposal analytics", included: true },
      { text: "Team collaboration (5 seats)", included: true, highlight: true },
    ],
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[20%] w-72 h-72 rounded-full bg-[#36C5F0]/5 blur-3xl" />
        <div className="absolute bottom-0 left-[10%] w-96 h-96 rounded-full bg-[#E01E5A]/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="text-center mb-16">
          {/* Launch offer banner */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E01E5A] to-[#ECB22E] px-4 py-2 text-sm text-white font-semibold mb-6 animate-pulse">
            <Zap className="h-4 w-4" />
            <span>🔥 Launch Special — Limited Time Only!</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Lock in launch pricing
            <br />
            <span className="bg-gradient-to-r from-[#2EB67D] to-[#36C5F0] bg-clip-text text-transparent">before it's gone</span>
          </h2>
          
          {/* Countdown Timer */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Timer className="h-4 w-4 text-[#E01E5A]" />
              <span>Offer expires in:</span>
            </div>
            <CountdownTimer />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Try ScopeGen with 2 free proposals. No credit card required.
          </p>
          <p className="text-base font-medium text-[#E01E5A] max-w-2xl mx-auto">
            ⏰ Early supporters get <span className="font-bold">$5/month off forever</span> — this offer won't last!
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={150}>
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-background rounded-2xl p-8 border-2 ${plan.color} transition-all duration-300 hover:shadow-xl`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#36C5F0] to-[#2EB67D] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Launch deal badge */}
              {plan.launchDeal && (
                <div className="absolute -top-4 -right-4">
                  <div className="bg-[#ECB22E] text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-12">
                    SAVE $5/mo
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.originalPrice && (
                    <span className="text-2xl text-muted-foreground line-through mr-2">{plan.originalPrice}</span>
                  )}
                  <span className={`text-5xl font-bold ${plan.launchDeal ? 'text-[#2EB67D]' : ''}`}>{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.launchDeal && (
                  <p className="text-xs text-[#E01E5A] font-medium mt-2">🔒 Price locked forever when you subscribe now</p>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${feature.highlight ? 'bg-[#2EB67D]' : 'bg-[#2EB67D]/20'}`}>
                        <CheckCircle2 className={`h-3 w-3 ${feature.highlight ? 'text-white' : 'text-[#2EB67D]'}`} />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                        <XCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Button 
                className={`w-full rounded-full ${plan.buttonColor}`}
                size="lg"
                asChild
              >
                <Link to="/wizard">{plan.buttonText}</Link>
              </Button>
            </div>
          ))}
        </StaggerContainer>

        {/* Money-back guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-[#2EB67D]" />
            <span>14-day money-back guarantee on all paid plans</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    question: "How does ScopeGen calculate pricing?",
    answer: "ScopeGen uses a smart pricing engine that considers project type, number of pages, integrations, animations, CMS requirements, and urgency. It factors in your hourly rate and applies industry-standard multipliers to give you accurate estimates based on real market data."
  },
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes 2 complete proposals with full access to all features—project types, integrations, PDF export, and the pricing calculator. No credit card required to get started."
  },
  {
    question: "Can I customize the proposals?",
    answer: "Yes! You can adjust your hourly rate, add client details, customize the scope of work, and modify deliverables before exporting. The proposal adapts to your specific project requirements."
  },
  {
    question: "What project types are supported?",
    answer: "ScopeGen supports Framer, Webflow, Shopify, and WordPress projects—covering everything from simple landing pages to complex e-commerce stores and membership sites."
  },
  {
    question: "How accurate are the pricing estimates?",
    answer: "Our pricing is based on real market rates and project complexity analysis. With a 98% client approval rate, freelancers find the estimates align well with industry standards and help them avoid underpricing."
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Absolutely! You can upgrade to Pro ($20/mo) or Agency ($40/mo) at any time for unlimited proposals. During our launch special, you get $5/month off forever — Pro at $15/mo and Agency at $35/mo. Downgrade anytime—we don't lock you in."
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#36C5F0]/10 px-4 py-2 text-sm text-[#36C5F0] font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Frequently Asked
            <br />
            <span className="bg-gradient-to-r from-[#36C5F0] to-[#2EB67D] bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about ScopeGen and how it can help you price projects accurately.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="text-left py-6 hover:no-underline group">
                    <span className="font-semibold text-lg group-hover:text-[#36C5F0] transition-colors">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
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
