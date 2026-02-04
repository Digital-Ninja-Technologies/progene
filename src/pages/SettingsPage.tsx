import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuthContext } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesManager } from "@/components/templates/TemplatesManager";
import { ClientsManager } from "@/components/clients/ClientsManager";
import { BrandingSettings } from "@/components/branding/BrandingSettings";
import { TimeTracker } from "@/components/analytics/TimeTracker";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { BillingSettings } from "@/components/billing/BillingSettings";
import { Loader2, FileText, Users, Palette, Clock, BarChart3, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get tab from URL or default to templates
  const defaultTab = searchParams.get('tab') || 'templates';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-14">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings & Tools</h1>
          <p className="text-muted-foreground mt-1">
            Manage templates, clients, branding, billing, and track your work
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto gap-1">
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
        </Tabs>
      </div>
    </div>
  );
}
