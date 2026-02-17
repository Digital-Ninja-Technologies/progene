import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Palette, 
  CreditCard, 
  Clock, 
  BarChart3, 
  UserCog,
  Plus,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

function NavItem({ to, icon, label, badge }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to.includes('?tab=') && location.pathname + location.search === to);

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export function DashboardSidebar() {
  const { user, profile, signOut, getRemainingProposals } = useAuthContext();
  const remaining = getRemainingProposals();
  const planBadge = profile?.subscription_plan === 'agency' 
    ? 'Agency' 
    : profile?.subscription_plan === 'pro' 
      ? 'Pro' 
      : 'Free';

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/50 min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col gap-2 p-4">
        {/* New Proposal Button */}
        <Button asChild className="w-full justify-start gap-2 mb-4">
          <NavLink to="/wizard">
            <Plus className="h-4 w-4" />
            New Proposal
          </NavLink>
        </Button>

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Overview
          </p>
          <NavItem 
            to="/dashboard" 
            icon={<LayoutDashboard className="h-4 w-4" />} 
            label="My Proposals" 
          />
        </div>

        {/* Settings Section */}
        <div className="space-y-1 mt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Settings
          </p>
          <NavItem 
            to="/settings?tab=templates" 
            icon={<FileText className="h-4 w-4" />} 
            label="Templates" 
          />
          <NavItem 
            to="/settings?tab=clients" 
            icon={<Users className="h-4 w-4" />} 
            label="Clients" 
          />
          <NavItem 
            to="/settings?tab=branding" 
            icon={<Palette className="h-4 w-4" />} 
            label="Branding" 
          />
          <NavItem 
            to="/settings?tab=billing" 
            icon={<CreditCard className="h-4 w-4" />} 
            label="Billing" 
            badge={planBadge}
          />
        </div>

        {/* Tools Section */}
        <div className="space-y-1 mt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Tools
          </p>
          <NavItem 
            to="/settings?tab=time" 
            icon={<Clock className="h-4 w-4" />} 
            label="Time Tracker" 
          />
          <NavItem 
            to="/settings?tab=analytics" 
            icon={<BarChart3 className="h-4 w-4" />} 
            label="Analytics" 
          />
        </div>

        {/* Account Section */}
        <div className="space-y-1 mt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Account
          </p>
          <NavItem 
            to="/settings?tab=account" 
            icon={<UserCog className="h-4 w-4" />} 
            label="Account Settings" 
          />
        </div>
      </div>

      {/* User Info & Sign Out */}
      <div className="mt-auto p-4 border-t border-border">
        {profile && !profile.is_premium && (
          <div className="text-sm text-muted-foreground mb-3">
            {remaining === 0 ? (
              <span className="text-destructive">No proposals left</span>
            ) : (
              <>{remaining} free proposal{remaining !== 1 ? 's' : ''} left</>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate">{profile?.full_name || user?.email}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full rounded-lg px-3 py-2 hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
