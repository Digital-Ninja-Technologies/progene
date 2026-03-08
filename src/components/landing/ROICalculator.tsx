import { useState, useMemo, useEffect, useRef } from "react";
import { Clock, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

function useAnimatedNumber(target: number, duration = 600) {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>();
  const startRef = useRef({ value: target, time: 0 });

  useEffect(() => {
    const start = startRef.current.value;
    const startTime = performance.now();
    startRef.current = { value: start, time: startTime };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(start + (target - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startRef.current = { value: target, time: now };
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

function AnimatedValue({ value, prefix = "", suffix = "", className = "" }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const animated = useAnimatedNumber(value);
  return (
    <span className={className}>
      {prefix}{Math.round(animated).toLocaleString()}{suffix}
    </span>
  );
}

function ComparisonBar({ label, hours, maxHours, color }: { label: string; hours: number; maxHours: number; color: string }) {
  const pct = maxHours > 0 ? Math.max((hours / maxHours) * 100, 2) : 2;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold">{Math.round(hours * 10) / 10}h</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function LandingROICalculator() {
  const [hourlyRate, setHourlyRate] = useState(75);
  const [proposalsPerMonth, setProposalsPerMonth] = useState(8);
  const [hoursPerProposal, setHoursPerProposal] = useState(3);

  const savings = useMemo(() => {
    const currentTimePerMonth = proposalsPerMonth * hoursPerProposal;
    const withProGene = proposalsPerMonth * (5 / 60);
    const hoursSaved = currentTimePerMonth - withProGene;
    const moneySaved = hoursSaved * hourlyRate;
    const yearlySaved = moneySaved * 12;
    return {
      currentTimePerMonth,
      withProGene: Math.round(withProGene * 10) / 10,
      hoursSaved: Math.round(hoursSaved * 10) / 10,
      moneySaved: Math.round(moneySaved),
      yearlySaved: Math.round(yearlySaved),
    };
  }, [hourlyRate, proposalsPerMonth, hoursPerProposal]);

  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="w-[90%] max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#2EB67D] mb-4">ROI Calculator</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            See how much you'll
            <br />
            <span className="bg-gradient-to-r from-[#2EB67D] to-[#36C5F0] bg-clip-text text-transparent">save with ProGene</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Input Side */}
            <div className="bg-card border border-border rounded-3xl p-8 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold">Your Hourly Rate</label>
                  <span className="text-2xl font-extrabold">${hourlyRate}</span>
                </div>
                <Slider value={[hourlyRate]} onValueChange={([v]) => setHourlyRate(v)} min={25} max={300} step={5} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>$25</span><span>$300</span></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold">Proposals per Month</label>
                  <span className="text-2xl font-extrabold">{proposalsPerMonth}</span>
                </div>
                <Slider value={[proposalsPerMonth]} onValueChange={([v]) => setProposalsPerMonth(v)} min={1} max={30} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1</span><span>30</span></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold">Current Hours per Proposal</label>
                  <span className="text-2xl font-extrabold">{hoursPerProposal}h</span>
                </div>
                <Slider value={[hoursPerProposal]} onValueChange={([v]) => setHoursPerProposal(v)} min={1} max={8} step={0.5} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1h</span><span>8h</span></div>
              </div>

              {/* Comparison Bar Chart */}
              <div className="pt-4 border-t border-border space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Time Comparison</p>
                <ComparisonBar label="Without ProGene" hours={savings.currentTimePerMonth} maxHours={savings.currentTimePerMonth} color="hsl(0 70% 55%)" />
                <ComparisonBar label="With ProGene" hours={savings.withProGene} maxHours={savings.currentTimePerMonth} color="hsl(152 60% 45%)" />
              </div>
            </div>

            {/* Results Side */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-3xl p-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#36C5F0]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-[#36C5F0]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hours saved per month</p>
                      <AnimatedValue value={savings.hoursSaved} suffix="h" className="text-3xl font-extrabold text-[#36C5F0]" />
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#2EB67D]/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-[#2EB67D]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Money saved per month</p>
                      <AnimatedValue value={savings.moneySaved} prefix="$" className="text-3xl font-extrabold text-[#2EB67D]" />
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#ECB22E]/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-[#ECB22E]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yearly savings</p>
                      <AnimatedValue value={savings.yearlySaved} prefix="$" className="text-4xl font-extrabold bg-gradient-to-r from-[#ECB22E] to-[#E01E5A] bg-clip-text text-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#2EB67D]/5 border border-[#2EB67D]/20 rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">That's a</p>
                <p className="text-2xl font-extrabold text-[#2EB67D]">
                  {Math.round(savings.yearlySaved / (15 * 12))}x return
                </p>
                <p className="text-sm text-muted-foreground">on a $15/mo Pro plan</p>
              </div>

              <Button size="lg" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90" asChild>
                <Link to="/wizard">
                  Start Saving Time Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
