import { format } from "date-fns";
import { Copy, Eye, Trash2, Calendar, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROJECT_TYPES, CURRENCIES } from "@/types/project";
import { SavedProposal } from "@/pages/DashboardPage";
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

interface ProposalCardProps {
  proposal: SavedProposal;
  onDelete: (id: string) => void;
  onDuplicate: (proposal: SavedProposal) => void;
}

export function ProposalCard({ proposal, onDelete, onDuplicate }: ProposalCardProps) {
  const navigate = useNavigate();
  const projectType = PROJECT_TYPES.find((t) => t.value === proposal.project_type);
  const currency = CURRENCIES.find((c) => c.value === proposal.project_config.currency);

  const handleView = () => {
    navigate(`/proposal/${proposal.id}`);
  };

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
          <Badge variant="secondary" className="shrink-0">
            {proposal.pricing_result.complexityLevel}
          </Badge>
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
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onDuplicate(proposal)}
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          Duplicate
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
