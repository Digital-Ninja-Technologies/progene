import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

interface Proposal {
  id: string;
  projectType: string;
  pricingResult: { recommendedPrice?: number } | null;
  clientSignedAt: string | null;
  clientSignature: string | null;
}

interface ProposalView {
  proposalId: string;
  viewedAt: string;
  viewerIp: string | null;
}

interface ProposalStats {
  proposalId: string;
  viewCount: number;
  lastViewed: string | null;
}

interface RevenueStats {
  totalValue: number;
  signedValue: number;
  pendingValue: number;
  proposalCount: number;
  signedCount: number;
}

export function useAnalytics() {
  const { getToken, isSignedIn } = useAuth();

  const { data: proposals = [], isLoading: loadingProposals } = useQuery<Proposal[]>({
    queryKey: ["proposals"],
    queryFn: async () => apiFetch("/api/proposals", { token: (await getToken()) ?? undefined }),
    enabled: !!isSignedIn,
  });

  const proposalIds = proposals.map((p) => p.id);

  const { data: allViews = [], isLoading: loadingViews } = useQuery<ProposalView[]>({
    queryKey: ["proposal-views"],
    queryFn: async () => apiFetch("/api/proposals/views", { token: (await getToken()) ?? undefined }),
    enabled: !!isSignedIn && proposalIds.length > 0,
  });

  const loading = loadingProposals || loadingViews;

  const revenueStats: RevenueStats = proposals.reduce(
    (acc, p) => {
      const price = p.pricingResult?.recommendedPrice ?? 0;
      acc.totalValue += price;
      acc.proposalCount++;
      if (p.clientSignedAt) {
        acc.signedValue += price;
        acc.signedCount++;
      }
      return acc;
    },
    { totalValue: 0, signedValue: 0, pendingValue: 0, proposalCount: 0, signedCount: 0 }
  );
  revenueStats.pendingValue = revenueStats.totalValue - revenueStats.signedValue;

  const proposalStats: ProposalStats[] = proposalIds.map((id) => {
    const views = allViews.filter((v) => v.proposalId === id);
    const lastViewed = views.reduce<string | null>((latest, v) => {
      if (!latest || v.viewedAt > latest) return v.viewedAt;
      return latest;
    }, null);
    return { proposalId: id, viewCount: views.length, lastViewed };
  });

  const getViewsForProposal = (proposalId: string) =>
    allViews.filter((v) => v.proposalId === proposalId);

  const getStatsForProposal = (proposalId: string) =>
    proposalStats.find((s) => s.proposalId === proposalId);

  return {
    proposals,
    proposalViews: allViews,
    proposalStats,
    revenueStats,
    loading,
    getViewsForProposal,
    getStatsForProposal,
  };
}
