import { useUser, useAuth, useClerk } from "@clerk/react";
import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Profile {
  id: string;
  userId: string;
  email: string | null;
  fullName: string | null;
  companyName: string | null;
  avatarUrl: string | null;
  proposalsUsed: number;
  isPremium: boolean;
  subscriptionPlan: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useAuthHook() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signOut: clerkSignOut, openSignIn, openSignUp } = useClerk();
  const qc = useQueryClient();

  const loading = !userLoaded || !authLoaded;

  const { data: profile, refetch: refetchProfile } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = await getToken();
      return apiFetch("/api/profile", { token: token ?? undefined });
    },
    enabled: !!isSignedIn,
  });

  const fetchProfile = useCallback(async () => {
    await refetchProfile();
  }, [refetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    const token = await getToken();
    await apiFetch("/api/profile", { method: "PUT", token: token ?? undefined, body: updates });
    await refetchProfile();
    return { error: null };
  }, [getToken, refetchProfile]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
    qc.clear();
    return { error: null };
  }, [clerkSignOut, qc]);

  const canCreateProposal = useCallback(() => {
    if (!profile) return false;
    if (profile.isPremium) return true;
    if (profile.subscriptionPlan === "pro" || profile.subscriptionPlan === "agency") return true;
    return profile.proposalsUsed < 3;
  }, [profile]);

  const getRemainingProposals = useCallback(() => {
    if (!profile) return 0;
    if (profile.isPremium) return Infinity;
    if (profile.subscriptionPlan === "pro" || profile.subscriptionPlan === "agency") return Infinity;
    return Math.max(0, 3 - profile.proposalsUsed);
  }, [profile]);

  return {
    user,
    profile: profile ?? null,
    loading,
    isSignedIn: !!isSignedIn,
    getToken,
    signOut,
    updateProfile,
    fetchProfile,
    canCreateProposal,
    getRemainingProposals,
    openSignIn,
    openSignUp,
  };
}
