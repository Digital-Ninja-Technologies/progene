import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CURRENCIES, Currency } from "@/types/project";
import { DollarSign, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingStepProps {
  hourlyRate: number;
  currency: Currency;
  onRateChange: (rate: number) => void;
  onCurrencyChange: (currency: Currency) => void;
}

const presetRates = [50, 75, 100, 125, 150, 200];

// Group currencies by region
const currencyGroups = [
  { label: "Americas", currencies: ['USD', 'CAD', 'BRL', 'MXN'] },
  { label: "Europe", currencies: ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK'] },
  { label: "Africa", currencies: ['NGN', 'ZAR', 'KES', 'GHS'] },
  { label: "Asia & Pacific", currencies: ['INR', 'JPY', 'CNY', 'SGD', 'HKD', 'AUD', 'NZD'] },
  { label: "Middle East", currencies: ['AED', 'SAR'] },
];

export function PricingStep({
  hourlyRate,
  currency,
  onRateChange,
  onCurrencyChange,
}: PricingStepProps) {
  const [open, setOpen] = useState(false);
  const selectedCurrency = CURRENCIES.find((c) => c.value === currency);
  const currencySymbol = selectedCurrency?.symbol || '$';

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold sm:text-3xl mb-3">
          Set your pricing
        </h2>
        <p className="text-muted-foreground">
          What's your hourly rate and preferred currency?
        </p>
      </div>

      {/* Currency Selection */}
      <div className="glass-card p-6">
        <Label className="text-base font-medium mb-4 block">Currency</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12 rounded-xl bg-background"
            >
              {selectedCurrency ? (
                <span className="flex items-center gap-2">
                  <span>{selectedCurrency.icon}</span>
                  <span className="font-mono">{selectedCurrency.symbol}</span>
                  <span>{selectedCurrency.label}</span>
                </span>
              ) : (
                "Select currency..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0 z-50 bg-popover border border-border shadow-lg" align="start">
            <Command className="bg-popover">
              <CommandInput placeholder="Search currency..." className="h-11" />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>No currency found.</CommandEmpty>
                {currencyGroups.map((group) => (
                  <CommandGroup key={group.label} heading={group.label}>
                    {group.currencies.map((code) => {
                      const curr = CURRENCIES.find((c) => c.value === code);
                      if (!curr) return null;
                      return (
                        <CommandItem
                          key={curr.value}
                          value={`${curr.value} ${curr.label}`}
                          onSelect={() => {
                            onCurrencyChange(curr.value);
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              currency === curr.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="mr-2">{curr.icon}</span>
                          <span className="font-mono mr-2">{curr.symbol}</span>
                          <span>{curr.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Hourly Rate */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-medium">Hourly Rate</Label>
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xl">
              {currencySymbol}
            </span>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => onRateChange(Math.max(1, parseInt(e.target.value) || 0))}
              className="pl-10 text-3xl font-semibold h-16 text-center rounded-xl bg-muted border-border"
              min={1}
              max={1000}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              /hour
            </span>
          </div>
        </div>

        {/* Rate Slider */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-3">
            <span>{currencySymbol}25</span>
            <span>{currencySymbol}300+</span>
          </div>
          <Slider
            value={[Math.min(hourlyRate, 300)]}
            onValueChange={(value) => onRateChange(value[0])}
            min={25}
            max={300}
            step={5}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {presetRates.map((rate) => (
            <button
              key={rate}
              onClick={() => onRateChange(rate)}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                hourlyRate === rate
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              {currencySymbol}{rate}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Your rate should reflect your experience and the value you provide.
        </p>
      </div>
    </div>
  );
}
