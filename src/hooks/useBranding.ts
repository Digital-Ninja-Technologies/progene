import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

export interface BrandingSettings {
  id: string;
  userId: string;
  logoUrl: string | null;
  companyName: string | null;
  tagline: string | null;
  primaryColor: string;
  secondaryColor: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useBranding() {
  const { getToken, isSignedIn } = useAuth();
  const qc = useQueryClient();

  const { data: branding = null, isLoading: loading } = useQuery<BrandingSettings | null>({
    queryKey: ["branding"],
    queryFn: async () => apiFetch("/api/branding", { token: (await getToken()) ?? undefined }),
    enabled: !!isSignedIn,
  });

  const saveBranding = useMutation({
    mutationFn: async (settings: Partial<BrandingSettings>) =>
      apiFetch<BrandingSettings>("/api/branding", { method: "POST", token: (await getToken()) ?? undefined, body: settings }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branding"] }),
  });

  return {
    branding,
    loading,
    saveBranding: (s: Partial<BrandingSettings>) => saveBranding.mutateAsync(s),
    refetch: () => qc.invalidateQueries({ queryKey: ["branding"] }),
  };
}
