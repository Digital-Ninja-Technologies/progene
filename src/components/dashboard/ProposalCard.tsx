import { useState } from "react";
import { format } from "date-fns";
import { Copy, Eye, Trash2, Calendar, Clock, DollarSign, Share2, Link as LinkIcon, Check, Globe, GlobeLock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROJECT_TYPES, CURRENCIES } from "@/types/project";
import { SavedProposal } from "@/pages/DashboardPage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProposalCardProps {
  proposal: SavedProposal;
  onDelete: (id: string) => void;
  onDuplicate: (proposal: SavedProposal) => void;
}

export function ProposalCard({ proposal, onDelete, onDuplicate }: ProposalCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const projectType = PROJECT_TYPES.find((t) => t.value === proposal.project_type);
  const currency = CURRENCIES.find((c) => c.value === proposal.project_config.currency);
  const [isPublic, setIsPublic] = useState((proposal as any).is_public || false);
  const [shareToken, setShareToken] = useState((proposal as any).share_token || null);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleView = () => {
    navigate(`/proposal/${proposal.id}`);
  };

  const togglePublic = async () => {
    if (!user) return;
    
    setUpdating(true);
    
    // When making public, also store branding snapshot for secure access
    if (!isPublic) {
      // Fetch current branding settings
      const { data: branding } = await supabase
        .from("branding_settings")
        .select("company_name, tagline, primary_color, secondary_color, website, email, phone, address, logo_url")
        .eq("user_id", user.id)
        .single();
      
      // Update proposal with is_public and branding snapshot
      const { error } = await supabase
        .from("proposals")
        .update({ 
          is_public: true,
          branding_snapshot: branding || null
        })
        .eq("id", proposal.id);

      if (error) {
        toast.error("Failed to update sharing settings");
      } else {
        setIsPublic(true);
        toast.success("Proposal is now shareable!");
      }
    } else {
      // Making private - just update is_public
      const { error } = await supabase
        .from("proposals")
        .update({ is_public: false })
        .eq("id", proposal.id);

      if (error) {
        toast.error("Failed to update sharing settings");
      } else {
        setIsPublic(false);
        toast.success("Proposal is now private");
      }
    }
    setUpdating(false);
  };

  const copyShareLink = async () => {
    if (!shareToken) {
      // Fetch the share token
      const { data } = await supabase
        .from("proposals")
        .select("share_token")
        .eq("id", proposal.id)
        .single();
      
      if (data?.share_token) {
        setShareToken(data.share_token);
        await copyToClipboard(data.share_token);
      }
    } else {
      await copyToClipboard(shareToken);
    }
  };

  const copyToClipboard = async (token: string) => {
    const url = `${window.location.origin}/p/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isSigned = !!(proposal as any).client_signed_at;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{projectType?.icon || "📄"}</span>
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {projectType?.label || proposal.project_type}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {proposal.project_config.pages} page{proposal.project_config.pages !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isSigned && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                Signed
              </Badge>
            )}
            <Badge variant="secondary" className="shrink-0">
              {proposal.pricing_result.complexityLevel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>
              {currency?.symbol || "$"}
              {proposal.pricing_result.recommendedPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{proposal.pricing_result.estimatedHours}h</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(proposal.created_at), "MMM d, yyyy")}</span>
          </div>
        </div>

        {proposal.project_config.integrations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {proposal.project_config.integrations.slice(0, 3).map((integration) => (
              <Badge key={integration} variant="outline" className="text-xs">
                {integration}
              </Badge>
            ))}
            {proposal.project_config.integrations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{proposal.project_config.integrations.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleView}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Share
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="center">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <GlobeLock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={togglePublic}
                  disabled={updating}
                >
                  {isPublic ? "Make Private" : "Make Public"}
                </Button>
              </div>
              {isPublic && (
                <Button 
                  className="w-full" 
                  size="sm" 
                  onClick={copyShareLink}
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onDuplicate(proposal)}
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete proposal?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your proposal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(proposal.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
