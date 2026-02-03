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
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl mb-2">
          Tell us about the scope
        </h2>
        <p className="text-muted-foreground">
          How many pages and what features does the project need?
        </p>
      </div>

      {/* Page Counter */}
      <div className="glass-card p-8">
        <div className="flex flex-col items-center">
          <Label className="text-lg font-medium mb-6">Number of Pages</Label>
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => adjustPages(-1)}
              disabled={pages <= 1}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold tabular-nums">{pages}</span>
              <span className="text-sm text-muted-foreground mt-1">
                {pages === 1 ? 'page' : 'pages'}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => adjustPages(1)}
              disabled={pages >= 50}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-2 mt-6">
            {[3, 5, 10, 15, 20].map((preset) => (
              <Button
                key={preset}
                variant={pages === preset ? "default" : "secondary"}
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
            <Label className="text-lg font-medium">Content Management System</Label>
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
