import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProposalView } from '@/types/database';

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
  const { user } = useAuthContext();
  const [proposalViews, setProposalViews] = useState<ProposalView[]>([]);
  const [proposalStats, setProposalStats] = useState<ProposalStats[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalValue: 0,
    signedValue: 0,
    pendingValue: 0,
    proposalCount: 0,
    signedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);

    // Fetch all proposals with their view counts
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .select('id, pricing_result, client_signed_at, is_public');

    if (!proposalsError && proposals) {
      // Calculate revenue stats
      let totalValue = 0;
      let signedValue = 0;
      let signedCount = 0;

      proposals.forEach((p: any) => {
        const price = p.pricing_result?.recommendedPrice || 0;
        totalValue += price;
        if (p.client_signed_at) {
          signedValue += price;
          signedCount++;
        }
      });

      setRevenueStats({
        totalValue,
        signedValue,
        pendingValue: totalValue - signedValue,
        proposalCount: proposals.length,
        signedCount,
      });

      // Fetch views for each proposal
      const proposalIds = proposals.map((p: any) => p.id);
      if (proposalIds.length > 0) {
        const { data: views, error: viewsError } = await supabase
          .from('proposal_views')
          .select('*')
          .in('proposal_id', proposalIds);

        if (!viewsError && views) {
          setProposalViews(views as ProposalView[]);

          // Calculate stats per proposal
          const statsMap = new Map<string, ProposalStats>();
          proposalIds.forEach(id => {
            statsMap.set(id, { proposalId: id, viewCount: 0, lastViewed: null });
          });

          views.forEach((view: ProposalView) => {
            const stats = statsMap.get(view.proposal_id);
            if (stats) {
              stats.viewCount++;
              if (!stats.lastViewed || view.viewed_at > stats.lastViewed) {
                stats.lastViewed = view.viewed_at;
              }
            }
          });

          setProposalStats(Array.from(statsMap.values()));
        }
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

  const getViewsForProposal = (proposalId: string) => {
    return proposalViews.filter(v => v.proposal_id === proposalId);
  };

  const getStatsForProposal = (proposalId: string) => {
    return proposalStats.find(s => s.proposalId === proposalId);
  };

  return {
    proposalViews,
    proposalStats,
    revenueStats,
    loading,
    getViewsForProposal,
    getStatsForProposal,
    refetch: fetchAnalytics,
  };
}
