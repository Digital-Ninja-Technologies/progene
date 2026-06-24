import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export interface SubscriptionData {
  subscribed: boolean;
  plan: "free" | "pro" | "agency";
  subscription_end: string | null;
  subscription_id?: string;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    currency: "$",
    proposals: 3,
    features: ["3 proposals/month", "Basic templates", "PDF export"],
  },
  pro: {
    name: "Pro",
    price: 15,
    currency: "$",
    proposals: Infinity,
    features: ["Unlimited proposals", "All templates", "Custom branding", "Client portal", "Analytics"],
  },
  agency: {
    name: "Agency",
    price: 35,
    currency: "$",
    proposals: Infinity,
    features: ["Everything in Pro", "Team collaboration", "Priority support", "API access", "White-label exports"],
  },
} as const;

export function useSubscription() {
  const { getToken, isSignedIn } = useAuth();
  const qc = useQueryClient();

  const { data: subscription = null, isLoading: loading } = useQuery<SubscriptionData | null>({
    queryKey: ["subscription"],
    queryFn: async () => apiFetch("/api/subscription", { token: (await getToken()) ?? undefined }),
    enabled: !!isSignedIn,
    refetchInterval: 60000,
  });

  const createCheckout = async (plan: "pro" | "agency") => {
    try {
      const token = (await getToken()) ?? undefined;
      const data = await apiFetch<{ url: string }>("/api/subscription/checkout", {
        method: "POST",
        token,
        body: { plan },
      });
      if (data.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast.error(error.message || "Failed to start checkout");
    }
  };

  const openCustomerPortal = async () => {
    try {
      const token = (await getToken()) ?? undefined;
      const data = await apiFetch<{ url: string }>("/api/subscription/portal", {
        method: "POST",
        token,
      });
      if (data.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast.error(error.message || "Failed to open subscription management");
    }
  };

  const currentPlan = subscription?.plan ?? "free";
  const isActive = subscription?.subscribed ?? false;
  const isPremium = isActive && (currentPlan === "pro" || currentPlan === "agency");

  return {
    subscription,
    loading,
    processingPayment: false,
    currentPlan,
    isActive,
    isPremium,
    createCheckout,
    openCustomerPortal,
    checkSubscription: () => qc.invalidateQueries({ queryKey: ["subscription"] }),
  };
}
