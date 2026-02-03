import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProjectDetailsStepProps {
  pages: number;
  cmsNeeded: boolean;
  onPagesChange: (pages: number) => void;
  onCmsChange: (cmsNeeded: boolean) => void;
}

export function ProjectDetailsStep({
  pages,
  cmsNeeded,
  onPagesChange,
  onCmsChange,
}: ProjectDetailsStepProps) {
  const adjustPages = (delta: number) => {
    const newPages = Math.max(1, Math.min(50, pages + delta));
    onPagesChange(newPages);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold sm:text-3xl mb-3">
          Tell us about the scope
        </h2>
        <p className="text-muted-foreground">
          How many pages and what features does the project need?
        </p>
      </div>

      {/* Page Counter */}
      <div className="glass-card p-8">
        <div className="flex flex-col items-center">
          <Label className="text-base font-medium mb-6">Number of Pages</Label>
          <div className="flex items-center gap-8">
            <Button
              variant="pill-outline"
              size="icon-lg"
              onClick={() => adjustPages(-1)}
              disabled={pages <= 1}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-6xl font-semibold tabular-nums">{pages}</span>
              <span className="text-sm text-muted-foreground mt-1">
                {pages === 1 ? 'page' : 'pages'}
              </span>
            </div>
            <Button
              variant="pill-outline"
              size="icon-lg"
              onClick={() => adjustPages(1)}
              disabled={pages >= 50}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-2 mt-8">
            {[3, 5, 10, 15, 20].map((preset) => (
              <Button
                key={preset}
                variant={pages === preset ? "pill" : "pill-muted"}
                size="sm"
                onClick={() => onPagesChange(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* CMS Toggle */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Content Management System</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Does the client need to edit content themselves?
            </p>
          </div>
          <Switch checked={cmsNeeded} onCheckedChange={onCmsChange} />
        </div>
      </div>
    </div>
  );
}
