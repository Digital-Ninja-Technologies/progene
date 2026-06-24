import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Copy, Pencil } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ProposalPreview } from "@/components/wizard/ProposalPreview";
import { ShareForSignature } from "@/components/proposal/ShareForSignature";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@clerk/react";
import { SavedProposal } from "@/pages/DashboardPage";
import { toast } from "sonner";

export default function ProposalViewPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuthContext();
  const { getToken } = useAuth();
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
    try {
      const token = (await getToken()) ?? undefined;
      const data = await apiFetch<SavedProposal>(`/api/proposals/${id}`, { token });
      setProposal(data);
    } catch {
      toast.error("Proposal not found");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleDuplicate = async () => {
    if (!proposal || !user) return;
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
      toast.success("Proposal duplicated!");
      navigate(`/proposal/${data.id}`);
    } catch {
      toast.error("Failed to duplicate proposal");
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
            <ShareForSignature proposalId={proposal.id} />
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
