import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <FileText className="h-4 w-4 text-background" />
          </div>
          <span className="text-base font-semibold">ScopeGen</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/wizard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Create Proposal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-sm">
            Log in
          </Button>
          <Button variant="pill" size="sm" asChild>
            <Link to="/wizard">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
