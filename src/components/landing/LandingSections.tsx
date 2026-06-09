import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <section className="relative overflow-hidden bg-background min-h-[100vh] flex items-center justify-center">
      {/* Soft ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />

      {/* Floating outcome pills, scattered around the headline */}
      {[
        { label: "Proposal Sent", color: "bg-emerald-50 text-emerald-700 border-emerald-200", pos: "top-[18%] left-[6%] -rotate-6" },
        { label: "Client Won", color: "bg-violet-50 text-violet-700 border-violet-200", pos: "top-[14%] right-[8%] rotate-6" },
        { label: "Scope Locked", color: "bg-rose-50 text-rose-700 border-rose-200", pos: "top-[34%] left-[14%] rotate-3" },
        { label: "Invoice Paid", color: "bg-amber-50 text-amber-700 border-amber-200", pos: "top-[30%] right-[12%] -rotate-3" },
        { label: "Hours Saved", color: "bg-sky-50 text-sky-700 border-sky-200", pos: "bottom-[22%] left-[10%] rotate-6" },
        { label: "Pricing Locked", color: "bg-violet-50 text-violet-700 border-violet-200", pos: "bottom-[26%] right-[10%] -rotate-6" },
        { label: "Project Booked", color: "bg-emerald-50 text-emerald-700 border-emerald-200", pos: "bottom-[12%] left-1/2 -translate-x-1/2 rotate-2" },
      ].map((p) => (
        <div
          key={p.label}
          className={`hidden md:block absolute ${p.pos} ${p.color} border rounded-full px-5 py-2 text-sm font-medium shadow-sm animate-float`}
        >
          {p.label}
        </div>
      ))}

      <div className="w-[90%] max-w-5xl mx-auto py-28 sm:py-32 lg:py-40 relative z-10">
        <div className="text-center">
          <ScrollReveal>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Proposal Intelligence</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="mb-6 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <span className="block text-foreground">Don't leave your next</span>
              <span className="block bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent py-1">
                client to chance
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="mb-10 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              ProGene is the connective tissue your freelance business has been missing: scoping, pricing, proposals, and invoicing as one engineered outcome.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 px-7 h-12 text-base" asChild>
                <Link to="/wizard">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl border-border bg-card h-12 px-7 text-base" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free tier always available</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cancel anytime</span>
            </div>
          </ScrollReveal>
        </div>
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
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      // Disable the zoom effect on mobile screens
      if (window.innerWidth < 768) {
        setScale(1);
        return;
      }
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / viewportHeight));
      const newScale = 1 - progress * 0.3;
      setScale(newScale);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden flex items-center justify-center bg-foreground px-5 md:px-0 py-5 min-h-[40vh]">
      <div
        className="w-full h-full overflow-hidden rounded-2xl md:rounded-none transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})`, borderRadius: `${(1 - scale) * 80}px` }}
      >
        {inView && (
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-contain md:object-cover"
            preload="metadata"
            playsInline
            ref={(el) => { if (el) el.playbackRate = 2; }}
          >
            <source src={progeneAdsVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
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

      {/* Scrolling testimonials (auto-marquee + manual scroll) */}
      <div className="group space-y-4 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex marquee whitespace-nowrap group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
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
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/40 transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Brand Kit
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem asChild>
                  <a href="/downloads/progene-style-guide.pdf" download className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">Style Guide (PDF)</span>
                      <span className="text-[11px] text-muted-foreground">Brand identity, tokens & typography</span>
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/downloads/progene-brand-assets.zip" download className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">Brand Assets (ZIP)</span>
                      <span className="text-[11px] text-muted-foreground">Logos, color swatches & UI samples</span>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="hidden sm:block text-xs text-muted-foreground">
              Built for developers who value their time ⚡
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
