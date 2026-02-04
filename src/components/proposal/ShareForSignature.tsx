import { useState, useEffect } from "react";
import { 
  Share2, 
  Link as LinkIcon, 
  Check, 
  Globe, 
  Copy,
  Mail,
  CheckCircle,
  Clock,
  Eye,
  PenLine,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ShareForSignatureProps {
  proposalId: string;
  onStatusChange?: () => void;
}

interface ProposalStatus {
  isPublic: boolean;
  shareToken: string | null;
  clientSignedAt: string | null;
  clientSignature: string | null;
  viewCount: number;
}

export function ShareForSignature({ proposalId, onStatusChange }: ShareForSignatureProps) {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ProposalStatus>({
    isPublic: false,
    shareToken: null,
    clientSignedAt: null,
    clientSignature: null,
    viewCount: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && proposalId) {
      fetchStatus();
    }
  }, [open, proposalId]);

  const fetchStatus = async () => {
    setLoading(true);
    
    // Fetch proposal status
    const { data: proposal } = await supabase
      .from("proposals")
      .select("is_public, share_token, client_signed_at, client_signature")
      .eq("id", proposalId)
      .single();

    // Fetch view count
    const { count } = await supabase
      .from("proposal_views")
      .select("*", { count: "exact", head: true })
      .eq("proposal_id", proposalId);

    if (proposal) {
      setStatus({
        isPublic: proposal.is_public || false,
        shareToken: proposal.share_token,
        clientSignedAt: proposal.client_signed_at,
        clientSignature: proposal.client_signature,
        viewCount: count || 0,
      });
    }
    
    setLoading(false);
  };

  const enableSharing = async () => {
    if (!user) return;
    
    setLoading(true);

    // Fetch current branding settings to snapshot
    const { data: branding } = await supabase
      .from("branding_settings")
      .select("company_name, tagline, primary_color, secondary_color, website, email, phone, address, logo_url")
      .eq("user_id", user.id)
      .single();

    // Update proposal with is_public and branding snapshot
    const { data, error } = await supabase
      .from("proposals")
      .update({ 
        is_public: true,
        branding_snapshot: branding || null
      })
      .eq("id", proposalId)
      .select("share_token")
      .single();

    if (error) {
      toast.error("Failed to enable sharing");
    } else {
      setStatus(prev => ({
        ...prev,
        isPublic: true,
        shareToken: data.share_token,
      }));
      toast.success("Sharing enabled! Copy the link to send to your client.");
      onStatusChange?.();
    }
    
    setLoading(false);
  };

  const copyShareLink = async () => {
    if (!status.shareToken) return;
    
    const url = `${window.location.origin}/p/${status.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = status.shareToken 
    ? `${window.location.origin}/p/${status.shareToken}`
    : "";

  const getProgressValue = () => {
    if (status.clientSignedAt) return 100;
    if (status.viewCount > 0) return 66;
    if (status.isPublic) return 33;
    return 0;
  };

  const getStatusStep = () => {
    if (status.clientSignedAt) return 3;
    if (status.viewCount > 0) return 2;
    if (status.isPublic) return 1;
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="pill" size="lg">
          <Share2 className="mr-2 h-4 w-4" />
          Share for Signature
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            E-Signature Workflow
          </DialogTitle>
          <DialogDescription>
            Share your proposal with clients for digital signature approval.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Progress Tracker */}
            <div className="space-y-3">
              <Progress value={getProgressValue()} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className={`flex flex-col items-center gap-1 ${getStatusStep() >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusStep() >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Globe className="h-4 w-4" />
                  </div>
                  <span>Shared</span>
                </div>
                <div className={`flex flex-col items-center gap-1 ${getStatusStep() >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusStep() >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Eye className="h-4 w-4" />
                  </div>
                  <span>Viewed</span>
                </div>
                <div className={`flex flex-col items-center gap-1 ${getStatusStep() >= 3 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusStep() >= 3 ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span>Signed</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {status.clientSignedAt ? (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Proposal Signed!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Signed by <span className="font-medium text-foreground">{status.clientSignature}</span> on{" "}
                  {new Date(status.clientSignedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : !status.isPublic ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ready to Share</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable sharing to generate a unique link for your client to view and sign the proposal.
                  </p>
                </div>
                <Button className="w-full" onClick={enableSharing} disabled={loading}>
                  <Globe className="mr-2 h-4 w-4" />
                  Enable Sharing & Get Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* View Stats */}
                {status.viewCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>Viewed {status.viewCount} time{status.viewCount !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Share Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Share Link</label>
                  <div className="flex gap-2">
                    <Input 
                      value={shareUrl} 
                      readOnly 
                      className="text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={copyShareLink}>
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={copyShareLink}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      const subject = encodeURIComponent("Proposal Ready for Review");
                      const body = encodeURIComponent(`Hi,\n\nPlease review and sign the proposal at the following link:\n\n${shareUrl}\n\nLet me know if you have any questions.\n\nBest regards`);
                      window.open(`mailto:?subject=${subject}&body=${body}`);
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email Link
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Your client can view the proposal and sign digitally using this link.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
