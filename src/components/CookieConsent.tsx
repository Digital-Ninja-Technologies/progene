import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "progene_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="w-[95%] max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-xl p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#ECB22E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="h-4 w-4 text-[#ECB22E]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">We use cookies 🍪</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use essential cookies to keep ProGene running and optional cookies to improve your experience.{" "}
              <Link to="/cookies" className="text-primary hover:underline">Learn more</Link>
            </p>
          </div>
          <button onClick={decline} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
