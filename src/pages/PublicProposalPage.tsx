import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "@/lib/api";
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
  projectType: string;
  projectConfig: any;
  pricingResult: any;
  proposalData: any;
  createdAt: string;
  clientSignedAt: string | null;
  clientSignature: string | null;
  brandingSnapshot?: {
    companyName: string | null;
    tagline: string | null;
    primaryColor: string;
    secondaryColor: string;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    logoUrl: string | null;
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

    try {
      const data = await apiFetch<PublicProposal>(`/api/proposals/share/${token}`);
      setProposal(data);
      // Fire-and-forget view log
      if (!hasLoggedView.current) {
        hasLoggedView.current = true;
        apiFetch(`/api/proposals/share/${token}/view`, {
          method: "POST",
          body: { viewerUserAgent: navigator.userAgent },
        }).catch(() => {});
      }
    } catch {
      setError("Proposal not found or is not public");
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
    try {
      await apiFetch(`/api/proposals/share/${token}/sign`, {
        method: "POST",
        body: { clientSignature: signatureName.trim() },
      });
      toast.success("Proposal signed successfully!");
      setProposal(prev => prev ? {
        ...prev,
        clientSignedAt: new Date().toISOString(),
        clientSignature: signatureName.trim(),
      } : null);
    } catch {
      toast.error("Failed to sign proposal");
    }
    setSigning(false);
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

  const projectType = PROJECT_TYPES.find(t => t.value === proposal.projectType);
  const currency = CURRENCIES.find(c => c.value === proposal.projectConfig.currency);
  const primaryColor = proposal.brandingSnapshot?.primaryColor || "#6366f1";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="border-b"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {proposal.brandingSnapshot?.companyName ? (
              <div>
                <h1
                  className="font-bold text-lg"
                  style={{ color: primaryColor }}
                >
                  {proposal.brandingSnapshot.companyName}
                </h1>
                {proposal.brandingSnapshot.tagline && (
                  <p className="text-xs text-muted-foreground">{proposal.brandingSnapshot.tagline}</p>
                )}
              </div>
            ) : (
              <Logo size="md" />
            )}
          </div>
          {proposal.clientSignedAt && (
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
              <h1 className="text-2xl font-bold">{projectType?.label || proposal.projectType}</h1>
              <p className="text-muted-foreground">{projectType?.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Created {format(new Date(proposal.createdAt), "MMMM d, yyyy")}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {proposal.pricingResult.estimatedHours} hours
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
              {currency?.symbol || "$"}{proposal.pricingResult.recommendedPrice.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              Timeline: ~{proposal.pricingResult.timelineWeeks} weeks
            </p>
          </CardContent>
        </Card>

        {/* Scope of Work */}
        {proposal.proposalData?.scopeOfWork?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scope of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {proposal.proposalData.scopeOfWork.map((item: string, i: number) => (
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
        {proposal.proposalData?.deliverables?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {proposal.proposalData.deliverables.map((item: string, i: number) => (
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
        {proposal.proposalData?.paymentStructure?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proposal.proposalData.paymentStructure.map((payment: any, i: number) => (
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
            {proposal.clientSignedAt ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold">Proposal Accepted</p>
                <p className="text-muted-foreground">
                  Signed by {proposal.clientSignature} on{" "}
                  {format(new Date(proposal.clientSignedAt), "MMMM d, yyyy 'at' h:mm a")}
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
        {proposal.brandingSnapshot && (
          <>
            <Separator className="my-8" />
            <div className="text-center text-sm text-muted-foreground space-y-2">
              {proposal.brandingSnapshot.companyName && (
                <p className="font-medium" style={{ color: primaryColor }}>
                  {proposal.brandingSnapshot.companyName}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                {proposal.brandingSnapshot.email && (
                  <a href={`mailto:${proposal.brandingSnapshot.email}`} className="flex items-center gap-1 hover:text-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {proposal.brandingSnapshot.email}
                  </a>
                )}
                {proposal.brandingSnapshot.phone && (
                  <a href={`tel:${proposal.brandingSnapshot.phone}`} className="flex items-center gap-1 hover:text-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {proposal.brandingSnapshot.phone}
                  </a>
                )}
                {proposal.brandingSnapshot.website && (
                  <a href={proposal.brandingSnapshot.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    {proposal.brandingSnapshot.website.replace(/^https?:\/\//, '')}
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
