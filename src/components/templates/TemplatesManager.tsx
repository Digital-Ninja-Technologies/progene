import { useState } from "react";
import { Save, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useTemplates } from "@/hooks/useTemplates";
import { ProposalTemplate } from "@/types/database";
import { ProjectConfig, PROJECT_TYPES } from "@/types/project";
import { format } from "date-fns";
import { toast } from "sonner";

interface TemplatesManagerProps {
  currentConfig?: ProjectConfig;
  onLoadTemplate?: (config: ProjectConfig) => void;
}

export function TemplatesManager({ currentConfig, onLoadTemplate }: TemplatesManagerProps) {
  const { templates, loading, saveTemplate, deleteTemplate } = useTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentConfig || !name.trim()) return;
    
    setSaving(true);
    const { error } = await saveTemplate(name.trim(), description.trim(), currentConfig);
    setSaving(false);

    if (error) {
      toast.error("Failed to save template");
    } else {
      toast.success("Template saved!");
      setName("");
      setDescription("");
      setIsOpen(false);
    }
  };

  const handleLoad = (template: ProposalTemplate) => {
    if (onLoadTemplate) {
      onLoadTemplate(template.project_config);
      toast.success(`Loaded template: ${template.name}`);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteTemplate(id);
    if (error) {
      toast.error("Failed to delete template");
    } else {
      toast.success("Template deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Templates</h3>
        {currentConfig?.type && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save Current as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Template</DialogTitle>
                <DialogDescription>
                  Save your current configuration as a reusable template.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Standard E-commerce Site"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this template..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!name.trim() || saving}>
                  {saving ? "Saving..." : "Save Template"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p>No templates saved yet</p>
            <p className="text-sm mt-1">Save your first template from the wizard</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => {
            const projectType = PROJECT_TYPES.find(t => t.value === template.project_config.type);
            return (
              <Card key={template.id} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{projectType?.icon || "📄"}</span>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                    {template.is_default && (
                      <Badge variant="secondary" className="shrink-0">Default</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <Badge variant="outline">{projectType?.label || template.project_config.type}</Badge>
                    <Badge variant="outline">{template.project_config.pages} pages</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(template.created_at), "MMM d, yyyy")}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleLoad(template)}
                    >
                      Load Template
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete template?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{template.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(template.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
