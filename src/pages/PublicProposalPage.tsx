import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  PenLine
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PROJECT_TYPES, CURRENCIES } from "@/types/project";
import { Logo } from "@/components/brand/Logo";

interface PublicProposal {
  id: string;
  project_type: string;
  project_config: any;
  pricing_result: any;
  proposal_data: any;
  created_at: string;
  client_signed_at: string | null;
  client_signature: string | null;
  branding?: {
    company_name: string | null;
    tagline: string | null;
    primary_color: string;
    secondary_color: string;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    logo_url: string | null;
  };
}

const MAX_SIGNATURE_LENGTH = 100;

const validateSignature = (name: string): string | null => {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) return 'Please enter your name';
  if (trimmed.length > MAX_SIGNATURE_LENGTH) {
    return `Name must be ${MAX_SIGNATURE_LENGTH} characters or less`;
  }
  
  // Restrict to common name characters
  if (!/^[a-zA-Z\s\-''.]+$/.test(trimmed)) {
    return 'Please use only letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
};

export default function PublicProposalPage() {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState("");
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const hasLoggedView = useRef(false);

  useEffect(() => {
    if (token) {
      fetchProposal();
    }
  }, [token]);

  const fetchProposal = async () => {
    setLoading(true);
    setError(null);

    // Fetch the proposal by share token
    const { data, error: fetchError } = await supabase
      .from("proposals")
      .select("id, project_type, project_config, pricing_result, proposal_data, created_at, client_signed_at, client_signature, user_id")
      .eq("share_token", token)
      .eq("is_public", true)
      .single();

    if (fetchError || !data) {
      setError("Proposal not found or is not public");
      setLoading(false);
      return;
    }

    // Fetch branding settings for the proposal owner
    const { data: branding } = await supabase
      .from("branding_settings")
      .select("*")
      .eq("user_id", data.user_id)
      .single();

    setProposal({
      ...data,
      branding: branding || undefined,
    } as PublicProposal);

    // Log view (only once per session)
    if (!hasLoggedView.current) {
      hasLoggedView.current = true;
      await supabase.from("proposal_views").insert([{
        proposal_id: data.id,
        viewer_user_agent: navigator.userAgent,
      }]);
      
      // Send view notification email (fire and forget)
      supabase.functions.invoke("proposal-notifications", {
        body: { proposalId: data.id, type: "view" },
      }).catch(err => console.error("Failed to send view notification:", err));
    }

    setLoading(false);
  };

  const handleSign = async () => {
    if (!proposal || !signatureName.trim()) return;

    const validationError = validateSignature(signatureName);
    if (validationError) {
      setSignatureError(validationError);
      toast.error(validationError);
      return;
    }
    setSignatureError(null);

    setSigning(true);
    // Use the secure RPC function for signing proposals
    const { error: signError } = await supabase.rpc('sign_proposal', {
      p_proposal_id: proposal.id,
      p_client_signature: signatureName.trim()
    });

    setSigning(false);

    if (signError) {
      toast.error("Failed to sign proposal");
    } else {
      toast.success("Proposal signed successfully!");
      setProposal(prev => prev ? {
        ...prev,
        client_signed_at: new Date().toISOString(),
        client_signature: signatureName.trim(),
      } : null);
      
      // Send signature notification email
      supabase.functions.invoke("proposal-notifications", {
        body: { 
          proposalId: proposal.id, 
          type: "sign", 
          clientSignature: signatureName.trim() 
        },
      }).catch(err => console.error("Failed to send sign notification:", err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposal Not Found</h2>
            <p className="text-muted-foreground">
              {error || "This proposal may have been removed or is no longer public."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projectType = PROJECT_TYPES.find(t => t.value === proposal.project_type);
  const currency = CURRENCIES.find(c => c.value === proposal.project_config.currency);
  const primaryColor = proposal.branding?.primary_color || "#6366f1";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="border-b"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {proposal.branding?.company_name ? (
              <div>
                <h1 
                  className="font-bold text-lg"
                  style={{ color: primaryColor }}
                >
                  {proposal.branding.company_name}
                </h1>
                {proposal.branding.tagline && (
                  <p className="text-xs text-muted-foreground">{proposal.branding.tagline}</p>
                )}
              </div>
            ) : (
              <Logo size="md" />
            )}
          </div>
          {proposal.client_signed_at && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Signed
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Proposal Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{projectType?.icon || "📄"}</span>
            <div>
              <h1 className="text-2xl font-bold">{projectType?.label || proposal.project_type}</h1>
              <p className="text-muted-foreground">{projectType?.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Created {format(new Date(proposal.created_at), "MMMM d, yyyy")}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {proposal.pricing_result.estimatedHours} hours
            </div>
          </div>
        </div>

        {/* Pricing */}
        <Card className="mb-6" style={{ borderColor: `${primaryColor}30` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" style={{ color: primaryColor }} />
              Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
              {currency?.symbol || "$"}{proposal.pricing_result.recommendedPrice.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              Timeline: ~{proposal.pricing_result.timelineWeeks} weeks
            </p>
          </CardContent>
        </Card>

        {/* Scope of Work */}
        {proposal.proposal_data?.scopeOfWork?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scope of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {proposal.proposal_data.scopeOfWork.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Deliverables */}
        {proposal.proposal_data?.deliverables?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {proposal.proposal_data.deliverables.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Payment Structure */}
        {proposal.proposal_data?.paymentStructure?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proposal.proposal_data.paymentStructure.map((payment: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{payment.label}</span>
                      <span className="text-muted-foreground ml-2">({payment.percentage}%)</span>
                    </div>
                    <span className="font-semibold">
                      {currency?.symbol || "$"}{payment.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature Section */}
        <Card style={{ borderColor: `${primaryColor}30` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5" />
              Accept Proposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proposal.client_signed_at ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold">Proposal Accepted</p>
                <p className="text-muted-foreground">
                  Signed by {proposal.client_signature} on{" "}
                  {format(new Date(proposal.client_signed_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  By typing your name below and clicking "Accept", you agree to the terms and pricing outlined in this proposal.
                </p>
                <div>
                  <label className="text-sm font-medium">Your Full Name</label>
                  <Input
                    value={signatureName}
                    onChange={(e) => {
                      setSignatureName(e.target.value);
                      if (signatureError) setSignatureError(null);
                    }}
                    placeholder="Type your full name to sign"
                    maxLength={MAX_SIGNATURE_LENGTH}
                    className={`mt-1.5 ${signatureError ? 'border-red-500' : ''}`}
                  />
                  {signatureError && (
                    <p className="text-sm text-red-500 mt-1">{signatureError}</p>
                  )}
                </div>
                <Button 
                  onClick={handleSign} 
                  disabled={!signatureName.trim() || signing}
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  {signing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PenLine className="mr-2 h-4 w-4" />
                  )}
                  Accept Proposal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Footer */}
        {proposal.branding && (
          <>
            <Separator className="my-8" />
            <div className="text-center text-sm text-muted-foreground space-y-2">
              {proposal.branding.company_name && (
                <p className="font-medium" style={{ color: primaryColor }}>
                  {proposal.branding.company_name}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                {proposal.branding.email && (
                  <a href={`mailto:${proposal.branding.email}`} className="flex items-center gap-1 hover:text-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {proposal.branding.email}
                  </a>
                )}
                {proposal.branding.phone && (
                  <a href={`tel:${proposal.branding.phone}`} className="flex items-center gap-1 hover:text-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {proposal.branding.phone}
                  </a>
                )}
                {proposal.branding.website && (
                  <a href={proposal.branding.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    {proposal.branding.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
