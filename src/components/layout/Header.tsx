import { LayoutDashboard, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";

export function Header() {
  const { user, profile, signOut, getRemainingProposals } = useAuthContext();
  const remaining = getRemainingProposals();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          {user && (
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              My Proposals
            </Link>
          )}
          <Link to="/wizard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Create Proposal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {profile && !profile.is_premium && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {remaining === 0 ? (
                      <span className="text-destructive">No proposals left</span>
                    ) : (
                      <>{remaining} free proposal{remaining !== 1 ? 's' : ''} left</>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{profile?.full_name || user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" className="rounded-lg" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
