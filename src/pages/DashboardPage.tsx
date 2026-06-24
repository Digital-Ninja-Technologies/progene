import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@clerk/react";
import { ProposalCard } from "@/components/dashboard/ProposalCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProjectConfig, PricingResult, ProposalData } from "@/types/project";

export interface SavedProposal {
  id: string;
  project_type: string;
  project_config: ProjectConfig;
  pricing_result: PricingResult;
  proposal_data: ProposalData;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<SavedProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const token = (await getToken()) ?? undefined;
      const data = await apiFetch<SavedProposal[]>("/api/proposals", { token });
      setProposals(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = (await getToken()) ?? undefined;
      await apiFetch(`/api/proposals/${id}`, { method: "DELETE", token });
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  };

  const handleDuplicate = async (proposal: SavedProposal) => {
    try {
      const token = (await getToken()) ?? undefined;
      const data = await apiFetch<SavedProposal>("/api/proposals", {
        method: "POST",
        token,
        body: {
          projectType: proposal.project_type,
          projectConfig: proposal.project_config,
          pricingResult: proposal.pricing_result,
          proposalData: proposal.proposal_data,
        },
      });
      setProposals((prev) => [data, ...prev]);
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Loading proposals..." />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Proposals</h1>
            <p className="text-muted-foreground mt-1">
              View, edit, and duplicate your saved proposals
            </p>
          </div>
          <Button onClick={() => navigate("/wizard")} className="lg:hidden">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_350px]">
          {/* Proposals Grid */}
          <div>
            {proposals.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Notification Center Sidebar */}
          <div className="order-first xl:order-last">
            <NotificationCenter />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
