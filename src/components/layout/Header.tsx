import { LayoutDashboard, LogOut, User, Settings, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { Logo } from "@/components/brand/Logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function Header() {
  const { user, profile, signOut, getRemainingProposals } = useAuthContext();
  const remaining = getRemainingProposals();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link 
        to="/" 
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={mobile ? closeMobileMenu : undefined}
      >
        Home
      </Link>
      
      <a 
        href="/#pricing" 
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={mobile ? closeMobileMenu : undefined}
      >
        Pricing
      </a>
      <a 
        href="/#faq" 
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={mobile ? closeMobileMenu : undefined}
      >
        FAQ
      </a>
      <Link 
        to="/contact" 
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={mobile ? closeMobileMenu : undefined}
      >
        Contact
      </Link>
      <Link 
        to="/cover-letter" 
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        onClick={mobile ? closeMobileMenu : undefined}
      >
        Cover Letter
        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground leading-none">Pro</span>
      </Link>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4">
      <div className="w-full max-w-5xl bg-card/70 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-lg shadow-foreground/5">
      <div className="w-[80%] flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex">
              <Button size="sm" className="rounded-lg gap-2" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" className="rounded-lg" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] pt-12">
              <nav className="flex flex-col gap-4">
                <NavLinks mobile />
              </nav>
              
              <div className="mt-8 pt-4 border-t border-border flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{profile?.full_name || user.email}</span>
                    </div>
                    {profile && !profile.is_premium && (
                      <div className="text-sm text-muted-foreground">
                        {remaining === 0 ? (
                          <span className="text-destructive">No proposals left</span>
                        ) : (
                          <>{remaining} free proposal{remaining !== 1 ? 's' : ''} left</>
                        )}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link to="/auth" onClick={closeMobileMenu}>Sign in</Link>
                    </Button>
                    <Button size="sm" className="rounded-lg" asChild>
                      <Link to="/auth" onClick={closeMobileMenu}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}