import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProposals(data as unknown as SavedProposal[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (!error) {
      setProposals((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDuplicate = async (proposal: SavedProposal) => {
    const insertData = {
      user_id: user!.id,
      project_type: proposal.project_type,
      project_config: JSON.parse(JSON.stringify(proposal.project_config)),
      pricing_result: JSON.parse(JSON.stringify(proposal.pricing_result)),
      proposal_data: JSON.parse(JSON.stringify(proposal.proposal_data)),
    };
    
    const { data, error } = await supabase
      .from("proposals")
      .insert([insertData])
      .select()
      .single();

    if (!error && data) {
      setProposals((prev) => [data as unknown as SavedProposal, ...prev]);
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
