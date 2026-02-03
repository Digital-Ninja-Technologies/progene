import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg accent-gradient shadow-glow">
            <FileText className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold">ScopeGen</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/wizard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Create Proposal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link to="/wizard">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
