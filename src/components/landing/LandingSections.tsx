import { useState, useEffect, useRef } from "react";
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
  Timer,
  ChevronRight,
  Layers,
  BarChart3,
  Palette,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { ScrollReveal, StaggerContainer } from "@/components/animations/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import progeneAdsVideo from "@/assets/Progene-Ads.mp4";

// Countdown Timer Component
function CountdownTimer() {
  const getEndDate = () => {
    const stored = localStorage.getItem('progene_launch_end');
    if (stored) return new Date(stored);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    localStorage.setItem('progene_launch_end', endDate.toISOString());
    return endDate;
  };

  const [endDate] = useState(getEndDate);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
      <div className="bg-card border border-border rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-sm">
        <span className="text-2xl sm:text-3xl font-bold tabular-nums">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-2 font-medium uppercase tracking-widest">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="text-xl font-light text-muted-foreground/50 self-start mt-5">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-xl font-light text-muted-foreground/50 self-start mt-5">:</span>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <span className="text-xl font-light text-muted-foreground/50 self-start mt-5">:</span>
      <TimeBlock value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

const features = [
  {
    icon: Clock,
    title: "Save Hours",
    description: "Generate professional proposals in under 5 minutes, not hours.",
    color: "#36C5F0",
    gradient: "from-[#36C5F0]/20 to-[#36C5F0]/5",
  },
  {
    icon: DollarSign,
    title: "Price Accurately",
    description: "Smart pricing engine accounts for complexity, urgency, and integrations.",
    color: "#2EB67D",
    gradient: "from-[#2EB67D]/20 to-[#2EB67D]/5",
  },
  {
    icon: FileText,
    title: "Export Anywhere",
    description: "PDF, clipboard, or email-ready formats for any workflow.",
    color: "#ECB22E",
    gradient: "from-[#ECB22E]/20 to-[#ECB22E]/5",
  },
  {
    icon: Zap,
    title: "Prevent Scope Creep",
    description: "Crystal clear deliverables keep projects on track.",
    color: "#E01E5A",
    gradient: "from-[#E01E5A]/20 to-[#E01E5A]/5",
  },
];

const painPoints = [
  { icon: XCircle, title: "Spending 2+ hours on each proposal", description: "That's time you could spend actually building." },
  { icon: AlertTriangle, title: "Guessing project prices", description: "Then regretting it halfway through when scope explodes." },
  { icon: DollarSign, title: "Undercharging for your work", description: "Because you don't know what others are charging." },
];

const solutions = [
  { icon: Rocket, title: "5-minute proposals", description: "Answer a few questions, get a complete proposal." },
  { icon: Target, title: "Data-driven pricing", description: "Based on real market rates and project complexity." },
  { icon: Shield, title: "Scope protection", description: "Clear deliverables that prevent scope creep." },
];

const projectTypes = [
  { name: "Framer Landing Pages", color: "#36C5F0" },
  { name: "Framer Marketing Sites", color: "#36C5F0" },
  { name: "Webflow Landing Pages", color: "#2EB67D" },
  { name: "Webflow Marketing Sites", color: "#2EB67D" },
  { name: "Webflow E-commerce", color: "#2EB67D" },
  { name: "Shopify Theme Customization", color: "#ECB22E" },
  { name: "Shopify Custom Stores", color: "#ECB22E" },
  { name: "Shopify Plus Enterprise", color: "#ECB22E" },
  { name: "WordPress Blogs", color: "#E01E5A" },
  { name: "WordPress Business Sites", color: "#E01E5A" },
  { name: "WordPress E-commerce", color: "#E01E5A" },
  { name: "WordPress Membership Sites", color: "#E01E5A" },
];

const stats = [
  { value: "5 min", label: "Average proposal time" },
  { value: "2,500+", label: "Proposals generated" },
  { value: "98%", label: "Client approval rate" },
  { value: "$2.4M", label: "Revenue priced" },
];

// ─── HERO ───────────────────────────────────────────────────────────────────

export function LandingHero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      
      {/* Large gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#36C5F0]/8 blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2EB67D]/8 blur-[120px]" />
      <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] rounded-full bg-[#ECB22E]/6 blur-[100px]" />
      
      {/* Content */}
      <div className="w-[90%] max-w-7xl mx-auto py-24 sm:py-32 lg:py-40 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <ScrollReveal>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-5 py-2.5 text-sm font-medium shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#2EB67D] animate-pulse" />
              <span className="text-muted-foreground">Stop underpricing your work</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={100}>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-8xl leading-[0.9]">
              <span className="block text-foreground">Proposals that</span>
              <span className="block bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] to-[#ECB22E] bg-clip-text text-transparent py-2">
                win clients
              </span>
            </h1>
          </ScrollReveal>

          {/* Subheadline */}
          <ScrollReveal delay={200}>
            <p className="mb-10 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Tired of spending hours on proposals that don't convert? Create 
              professional, accurately-priced proposals in <span className="text-foreground font-semibold">under 5 minutes</span>.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button size="xl" className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-2xl shadow-foreground/20 text-base px-8" asChild>
                <Link to="/wizard">
                  Create Your First Proposal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-border/60 backdrop-blur-sm" asChild>
                <Link to="/wizard">
                  See How It Works
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          {/* Social proof */}
          <ScrollReveal delay={400}>
            <div className="flex items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {["#36C5F0", "#2EB67D", "#ECB22E", "#E01E5A"].map((color, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">2,500+ proposals created</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#ECB22E] text-[#ECB22E]" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Floating proposal cards */}
        <ScrollReveal delay={500}>
          <div className="mt-20 relative max-w-5xl mx-auto">
            {/* Main card */}
            <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl shadow-foreground/5 mx-auto max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#36C5F0] to-[#2EB67D] flex items-center justify-center shadow-lg shadow-[#36C5F0]/20">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Proposal Generated</p>
                  <p className="text-sm text-muted-foreground">WordPress E-commerce • 12 pages</p>
                </div>
                <div className="flex items-center gap-2 bg-[#2EB67D]/10 text-[#2EB67D] px-3 py-1.5 rounded-full text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Hours</p>
                  <p className="text-2xl font-bold">68h</p>
                </div>
                <div className="bg-background rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Value</p>
                  <p className="text-2xl font-bold text-[#2EB67D]">$8,500</p>
                </div>
                <div className="bg-background rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Created in</p>
                  <p className="text-2xl font-bold text-[#36C5F0]">4 min</p>
                </div>
              </div>
            </div>

            {/* Floating accent cards */}
            <div className="absolute -top-6 -left-4 lg:left-8 bg-card border border-border rounded-2xl p-4 shadow-xl animate-float hidden sm:flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ECB22E] to-[#E01E5A] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI-Powered</p>
                <p className="text-xs text-muted-foreground">Smart pricing</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 lg:right-8 bg-card border border-border rounded-2xl p-4 shadow-xl animate-float-delayed hidden sm:flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#36C5F0]/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#36C5F0]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#36C5F0]">2+ hours saved</p>
                <p className="text-xs text-muted-foreground">Per proposal</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── STATS MARQUEE ──────────────────────────────────────────────────────────

export function LandingStats() {
  const allStats = [...stats, ...stats, ...stats, ...stats];
  
  return (
    <section className="py-6 border-y border-border bg-card overflow-hidden">
      <div className="flex marquee whitespace-nowrap">
        {allStats.map((stat, i) => (
          <div key={i} className="flex items-center gap-3 mx-8 sm:mx-12">
            <span className="text-2xl sm:text-3xl font-extrabold">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#2EB67D] ml-4" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PAIN POINTS ────────────────────────────────────────────────────────────

export function LandingPainPoints() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />
      
      <div className="w-[90%] max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#E01E5A] mb-4">Sound familiar?</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Freelancing is hard enough.
            <br />
            <span className="text-muted-foreground">Proposals shouldn't be.</span>
          </h2>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Pain column */}
          <ScrollReveal direction="left" delay={100}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-[#E01E5A]/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-[#E01E5A]" />
                </div>
                <span className="font-bold text-lg text-[#E01E5A]">Without ProGene</span>
              </div>
              {painPoints.map((point) => (
                <div key={point.title} className="group bg-card border border-border rounded-2xl p-6 hover:border-[#E01E5A]/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#E01E5A]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-[#2EB67D]/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[#2EB67D]" />
                </div>
                <span className="font-bold text-lg text-[#2EB67D]">With ProGene</span>
              </div>
              {solutions.map((point) => (
                <div key={point.title} className="group bg-card border border-border rounded-2xl p-6 hover:border-[#2EB67D]/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#2EB67D]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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

// ─── FEATURES (BENTO GRID) ─────────────────────────────────────────────────

export function LandingFeatures() {
  return (
    <section className="py-28 lg:py-36 bg-card relative overflow-hidden grain-overlay">
      <div className="w-[90%] max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#36C5F0] mb-4">Features</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-[#36C5F0] to-[#2EB67D] bg-clip-text text-transparent">price projects right</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-6 max-w-xl mx-auto">
            Built specifically for WordPress, Framer, Webflow, and Shopify developers.
          </p>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 100}>
              <div
                className={`group relative bg-background border border-border rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden ${
                  i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
                } ${i === 3 ? "lg:col-span-2" : ""}`}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                
                <div className="relative z-10">
                  <div
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 duration-300"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ───────────────────────────────────────────────────────────

export function LandingHowItWorks() {
  const steps = [
    { number: "01", title: "Choose your project type", description: "Select from WordPress, Framer, Webflow, or Shopify templates.", color: "#36C5F0" },
    { number: "02", title: "Answer a few questions", description: "Pages, features, integrations, timeline — we ask, you answer.", color: "#2EB67D" },
    { number: "03", title: "Get your proposal", description: "Receive a complete, professional proposal with accurate pricing.", color: "#ECB22E" },
    { number: "04", title: "Win the client", description: "Send it off and close the deal with confidence.", color: "#E01E5A" },
  ];

  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      {/* Connecting line decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="w-[90%] max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            From zero to proposal
            <br />
            <span className="bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] via-[#ECB22E] to-[#E01E5A] bg-clip-text text-transparent">in 4 simple steps</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 120}>
              <div className="group relative">
                {/* Step number - large background */}
                <div className="text-[120px] font-black leading-none opacity-[0.04] absolute -top-8 -left-2 select-none" style={{ color: step.color }}>
                  {step.number}
                </div>
                
                <div className="relative bg-card border border-border rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:border-transparent"
                  style={{ '--hover-color': `${step.color}30` } as React.CSSProperties}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold mb-6 shadow-lg"
                    style={{ backgroundColor: step.color, boxShadow: `0 8px 24px -4px ${step.color}40` }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROJECT TYPES ──────────────────────────────────────────────────────────

export function LandingProjectTypes() {
  const row1 = projectTypes.slice(0, 6);
  const row2 = projectTypes.slice(6);
  
  return (
    <section className="py-28 lg:py-36 bg-card overflow-hidden">
      <div className="w-[90%] max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#ECB22E] mb-4">Project Types</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Tailored pricing for
            <br />
            <span className="bg-gradient-to-r from-[#ECB22E] to-[#E01E5A] bg-clip-text text-transparent">every project type</span>
          </h2>
        </ScrollReveal>
      </div>

      {/* Marquee rows */}
      <div className="space-y-4">
        <div className="flex marquee whitespace-nowrap">
          {[...row1, ...row1, ...row1, ...row1].map((type, i) => (
            <div key={i} className="flex items-center gap-3 bg-background border border-border rounded-full px-6 py-3 mx-2 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
              <span className="text-sm font-medium">{type.name}</span>
            </div>
          ))}
        </div>
        <div className="flex marquee-reverse whitespace-nowrap">
          {[...row2, ...row2, ...row2, ...row2].map((type, i) => (
            <div key={i} className="flex items-center gap-3 bg-background border border-border rounded-full px-6 py-3 mx-2 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
              <span className="text-sm font-medium">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-14">
        <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90" asChild>
          <Link to="/wizard">
            Try it now — free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ─── VIDEO ──────────────────────────────────────────────────────────────────

export function LandingVideo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / viewportHeight));
      const newScale = 1 - progress * 0.3;
      setScale(newScale);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-foreground">
      <div
        className="w-full h-full overflow-hidden transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})`, borderRadius: `${(1 - scale) * 80}px` }}
      >
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
          preload="metadata"
          playsInline
          ref={(el) => { if (el) el.playbackRate = 2; }}
        >
          <source src={progeneAdsVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ───────────────────────────────────────────────────────────

const testimonials = [
  { quote: "I used to spend 3+ hours on every proposal. Now I'm done in 10 minutes and my close rate actually went UP.", name: "Sarah Chen", role: "Freelance WordPress Developer", avatar: "SC", color: "#36C5F0", platform: "WordPress" },
  { quote: "Finally stopped undercharging for my Webflow projects. ProGene helped me realize I was leaving thousands on the table.", name: "Marcus Johnson", role: "Webflow Agency Owner", avatar: "MJ", color: "#2EB67D", platform: "Webflow" },
  { quote: "The scope documents are incredibly detailed. My clients actually read them now and we have way fewer scope conversations.", name: "Emily Rodriguez", role: "Framer Designer", avatar: "ER", color: "#ECB22E", platform: "Framer" },
  { quote: "Game changer for my Shopify agency. We've standardized our proposals across the team and everyone prices consistently.", name: "David Park", role: "Shopify Plus Partner", avatar: "DP", color: "#E01E5A", platform: "Shopify" },
  { quote: "ProGene showed me exactly how to justify higher prices with detailed scope breakdowns. Clients respect it more.", name: "Jessica Williams", role: "Full-Stack Freelancer", avatar: "JW", color: "#36C5F0", platform: "WordPress" },
  { quote: "No more awkward pricing conversations. I just send the proposal and let ProGene do the talking.", name: "Alex Thompson", role: "Web Design Studio", avatar: "AT", color: "#2EB67D", platform: "Webflow" },
];

export function LandingTestimonials() {
  const allTestimonials = [...testimonials, ...testimonials];
  
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      <div className="w-[90%] max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#E01E5A] mb-4">Testimonials</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Loved by
            <span className="bg-gradient-to-r from-[#36C5F0] via-[#2EB67D] to-[#E01E5A] bg-clip-text text-transparent"> freelancers</span>
          </h2>
        </ScrollReveal>
      </div>

      {/* Scrolling testimonials */}
      <div className="space-y-4 overflow-hidden">
        <div className="flex marquee whitespace-nowrap">
          {allTestimonials.map((t, i) => (
            <div key={i} className="w-[400px] flex-shrink-0 mx-3">
              <div className="bg-card border border-border rounded-3xl p-6 h-full whitespace-normal">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#ECB22E] text-[#ECB22E]" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed text-[15px]">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{t.platform}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ────────────────────────────────────────────────────────────────

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for trying out ProGene",
    price: "$0",
    originalPrice: null,
    period: "forever",
    buttonVariant: "outline" as const,
    buttonText: "Get Started Free",
    popular: false,
    launchDeal: false,
    features: [
      { text: "3 proposals included", included: true },
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
    originalPrice: "$25",
    period: "/month",
    buttonVariant: "default" as const,
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
    originalPrice: "$45",
    period: "/month",
    buttonVariant: "outline" as const,
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
  const navigate = useNavigate();
  
  const handlePlanClick = (planName: string) => {
    if (planName === "Free") {
      navigate("/wizard");
    } else {
      sessionStorage.setItem('intended_plan', planName.toLowerCase());
      navigate("/auth?redirect=/settings?tab=billing");
    }
  };

  return (
    <section id="pricing" className="py-28 lg:py-36 bg-card relative overflow-hidden grain-overlay">
      <div className="w-[90%] max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E01E5A]/10 border border-[#E01E5A]/20 px-5 py-2.5 text-sm font-semibold mb-6">
            <Zap className="h-4 w-4 text-[#E01E5A]" />
            <span className="text-[#E01E5A]">🔥 Launch Special — Limited Time</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Lock in launch pricing
            <br />
            <span className="bg-gradient-to-r from-[#2EB67D] to-[#36C5F0] bg-clip-text text-transparent">before it's gone</span>
          </h2>
          
          <div className="mt-10 mb-8">
            <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
              <Timer className="h-4 w-4 text-[#E01E5A]" />
              Offer expires in:
            </p>
            <CountdownTimer />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try ProGene with 3 free proposals. No credit card required.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 100}>
              <div className={`relative bg-background rounded-3xl p-8 border-2 transition-all duration-500 hover:shadow-2xl ${
                plan.popular 
                  ? "border-foreground shadow-xl scale-[1.02]" 
                  : "border-border hover:-translate-y-1"
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-foreground text-background text-xs font-bold px-5 py-2 rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}

                {plan.launchDeal && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-[#ECB22E] text-foreground text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-12">
                      SAVE $10/mo
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.originalPrice && (
                      <span className="text-xl text-muted-foreground line-through mr-2">{plan.originalPrice}</span>
                    )}
                    <span className="text-5xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  {plan.launchDeal && (
                    <p className="text-xs text-[#E01E5A] font-medium mt-3">🔒 Locked forever when you subscribe</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${feature.highlight ? 'text-[#2EB67D]' : 'text-muted-foreground'}`} />
                      ) : (
                        <XCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground/60'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full rounded-full ${plan.popular ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handlePlanClick(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>

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

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  { question: "How does ProGene calculate pricing?", answer: "ProGene uses a smart pricing engine that considers project type, number of pages, integrations, animations, CMS requirements, and urgency. It factors in your hourly rate and applies industry-standard multipliers to give you accurate estimates based on real market data." },
  { question: "What's included in the free plan?", answer: "The free plan includes 3 complete proposals with full access to all features—project types, integrations, PDF export, and the pricing calculator. No credit card required to get started." },
  { question: "Can I customize the proposals?", answer: "Yes! You can adjust your hourly rate, add client details, customize the scope of work, and modify deliverables before exporting. The proposal adapts to your specific project requirements." },
  { question: "What project types are supported?", answer: "ProGene supports Framer, Webflow, Shopify, and WordPress projects—covering everything from simple landing pages to complex e-commerce stores and membership sites." },
  { question: "How accurate are the pricing estimates?", answer: "Our pricing is based on real market rates and project complexity analysis. With a 98% client approval rate, freelancers find the estimates align well with industry standards and help them avoid underpricing." },
  { question: "Can I upgrade or downgrade my plan anytime?", answer: "Absolutely! You can upgrade to Pro ($25/mo) or Agency ($45/mo) at any time for unlimited proposals. During our launch special, you get $10/month off forever — Pro at $15/mo and Agency at $35/mo. Downgrade anytime—we don't lock you in." },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="py-28 lg:py-36 relative">
      <div className="absolute inset-0 dot-grid opacity-20" />
      
      <div className="w-[90%] max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
          <ScrollReveal>
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#36C5F0] mb-4">FAQ</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                Frequently Asked
                <br />
                <span className="bg-gradient-to-r from-[#36C5F0] to-[#2EB67D] bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about ProGene and how it can help you price projects accurately.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="text-left py-5 hover:no-underline group">
                    <span className="font-semibold text-base group-hover:text-[#36C5F0] transition-colors pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ────────────────────────────────────────────────────────────────────

export function LandingCTA() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-foreground" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] rounded-full bg-[#36C5F0]/10 blur-[150px]" />
      <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] rounded-full bg-[#2EB67D]/10 blur-[150px]" />
      
      <div className="w-[90%] max-w-4xl mx-auto relative z-10 text-center">
        <h2 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-background leading-tight">
          Ready to stop guessing
          <br />
          and start winning?
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-background/60 mb-12">
          Join thousands of freelancers who've stopped underpricing their work. 
          Start with <span className="font-semibold text-background">3 free proposals</span>—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" className="rounded-full bg-background text-foreground hover:bg-background/90 shadow-2xl text-base px-8" asChild>
            <Link to="/wizard">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full border-background/20 text-background hover:bg-background/10" asChild>
            <Link to="/wizard">
              Watch Demo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────

export function LandingFooter() {
  const footerLinks = {
    Product: [
      { label: "Proposal Wizard", href: "/wizard" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Templates", href: "/dashboard" },
    ],
    Resources: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/contact" },
      { label: "Cover Letters", href: "/cover-letter" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="relative border-t border-border bg-card overflow-hidden">
      {/* Subtle mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute inset-0 dot-grid opacity-10" />

      <div className="w-[90%] max-w-7xl mx-auto relative z-10">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 py-16">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Generate professional proposals in under 5 minutes. Built for freelancers, agencies, and developers who value their time.
            </p>
            <div className="flex items-center gap-3">
              {/* Social icons as colored dots */}
              {[
                { color: "bg-[#36C5F0]", label: "Twitter", href: "#" },
                { color: "bg-[#2EB67D]", label: "GitHub", href: "#" },
                { color: "bg-[#ECB22E]", label: "LinkedIn", href: "#" },
                { color: "bg-[#E01E5A]", label: "YouTube", href: "#" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`h-8 w-8 rounded-full ${social.color} opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-200 flex items-center justify-center`}
                >
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ProGene. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for developers who value their time ⚡
          </p>
        </div>
      </div>
    </footer>
  );
}
