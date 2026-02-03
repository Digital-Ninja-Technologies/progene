import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No proposals yet</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first proposal to start building professional project scopes and pricing estimates.
      </p>
      <Button onClick={() => navigate("/wizard")}>
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Proposal
      </Button>
    </div>
  );
}
