import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesManager } from "@/components/templates/TemplatesManager";
import { ClientsManager } from "@/components/clients/ClientsManager";
import { BrandingSettings } from "@/components/branding/BrandingSettings";
import { TimeTracker } from "@/components/analytics/TimeTracker";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BillingSettings } from "@/components/billing/BillingSettings";
import { AccountDeletion } from "@/components/settings/AccountDeletion";
import { Loader2, FileText, Users, Palette, Clock, BarChart3, CreditCard, UserCog } from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Sync tab with URL
  const activeTab = searchParams.get('tab') || 'templates';

  useEffect(() => {
    if (!authLoading && !user) {
      // Preserve the current tab in the redirect
      const currentTab = searchParams.get('tab');
      const redirectPath = currentTab ? `/settings?tab=${currentTab}` : '/settings';
      navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [authLoading, user, navigate, searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings & Tools</h1>
          <p className="text-muted-foreground mt-1">
            Manage templates, clients, branding, billing, and track your work
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="space-y-6">
          {/* Mobile-only tabs - hidden on desktop since sidebar handles navigation */}
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 h-auto gap-1 lg:hidden">
            <TabsTrigger value="templates" className="flex items-center gap-2 py-2.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 py-2.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2 py-2.5">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 py-2.5">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2 py-2.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 py-2.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 py-2.5">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6">
            <TemplatesManager />
          </TabsContent>

          <TabsContent value="clients" className="mt-6">
            <ClientsManager />
          </TabsContent>

          <TabsContent value="branding" className="mt-6">
            <BrandingSettings />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingSettings />
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            <TimeTracker />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Account Settings</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage your account preferences and data
                </p>
              </div>
              <AccountDeletion />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
