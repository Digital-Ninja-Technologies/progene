import { useState, useMemo } from "react";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function LandingROICalculator() {
  const [hourlyRate, setHourlyRate] = useState(75);
  const [proposalsPerMonth, setProposalsPerMonth] = useState(8);
  const [hoursPerProposal, setHoursPerProposal] = useState(3);

  const savings = useMemo(() => {
    const currentTimePerMonth = proposalsPerMonth * hoursPerProposal; // hours
    const withProGene = proposalsPerMonth * (5 / 60); // 5 min each
    const hoursSaved = currentTimePerMonth - withProGene;
    const moneySaved = hoursSaved * hourlyRate;
    const yearlySaved = moneySaved * 12;
    return { hoursSaved: Math.round(hoursSaved * 10) / 10, moneySaved: Math.round(moneySaved), yearlySaved: Math.round(yearlySaved) };
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
              {/* Hourly Rate */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold">Your Hourly Rate</label>
                  <span className="text-2xl font-extrabold">${hourlyRate}</span>
                </div>
                <Slider
                  value={[hourlyRate]}
                  onValueChange={([v]) => setHourlyRate(v)}
                  min={25}
                  max={300}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$25</span>
                  <span>$300</span>
                </div>
              </div>

              {/* Proposals per month */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold">Proposals per Month</label>
                  <span className="text-2xl font-extrabold">{proposalsPerMonth}</span>
                </div>
                <Slider
                  value={[proposalsPerMonth]}
                  onValueChange={([v]) => setProposalsPerMonth(v)}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>30</span>
                </div>
              </div>

              {/* Hours per proposal currently */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold">Current Hours per Proposal</label>
                  <span className="text-2xl font-extrabold">{hoursPerProposal}h</span>
                </div>
                <Slider
                  value={[hoursPerProposal]}
                  onValueChange={([v]) => setHoursPerProposal(v)}
                  min={1}
                  max={8}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1h</span>
                  <span>8h</span>
                </div>
              </div>
            </div>

            {/* Results Side */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-3xl p-8">
                <div className="grid grid-cols-1 gap-6">
                  {/* Hours saved */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#36C5F0]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-[#36C5F0]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hours saved per month</p>
                      <p className="text-3xl font-extrabold text-[#36C5F0]">{savings.hoursSaved}h</p>
                    </div>
                  </div>

                  {/* Money saved monthly */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#2EB67D]/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-[#2EB67D]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Money saved per month</p>
                      <p className="text-3xl font-extrabold text-[#2EB67D]">${savings.moneySaved.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Money saved yearly */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#ECB22E]/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-[#ECB22E]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yearly savings</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-[#ECB22E] to-[#E01E5A] bg-clip-text text-transparent">
                        ${savings.yearlySaved.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI message */}
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
