import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Copy, Pencil } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ProposalPreview } from "@/components/wizard/ProposalPreview";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SavedProposal } from "@/pages/DashboardPage";
import { toast } from "sonner";

export default function ProposalViewPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<SavedProposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchProposal();
    }
  }, [user, id]);

  const fetchProposal = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Proposal not found");
      navigate("/dashboard");
      return;
    }

    setProposal(data as unknown as SavedProposal);
    setLoading(false);
  };

  const handleDuplicate = async () => {
    if (!proposal || !user) return;

    const insertData = {
      user_id: user.id,
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
      toast.success("Proposal duplicated!");
      navigate(`/proposal/${data.id}`);
    }
  };

  const handleEdit = () => {
    if (!proposal) return;
    // Store config in sessionStorage and redirect to wizard
    sessionStorage.setItem("editProposalConfig", JSON.stringify(proposal.project_config));
    sessionStorage.setItem("editProposalId", proposal.id);
    navigate("/wizard");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-14">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <ProposalPreview proposal={proposal.proposal_data} />
        </div>
      </div>
    </div>
  );
}
