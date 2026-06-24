import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import { ProjectConfig, PROPOSAL_TONES, ProposalTone } from "@/types/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIScopeWriterProps {
  config: ProjectConfig;
  existingScope: string[];
  onScopeGenerated: (scope: string[]) => void;
}

export function AIScopeWriter({ config, existingScope, onScopeGenerated }: AIScopeWriterProps) {
  const { getToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScope, setGeneratedScope] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [tone, setTone] = useState<ProposalTone>(config.tone ?? "professional");

  const generateScope = async () => {
    if (!config.type) {
      toast.error("Please select a project type first");
      return;
    }

    setIsGenerating(true);
    setGeneratedScope([]);
    setSelectedItems(new Set());

    try {
      const token = (await getToken()) ?? undefined;
      const data = await apiFetch<{ scope: string[] }>("/api/ai/scope", {
        method: "POST",
        token,
        body: {
          projectType: config.type,
          pages: config.pages,
          cmsNeeded: config.cmsNeeded,
          integrations: config.integrations,
          animations: config.animations,
          urgency: config.urgency,
          maintenance: config.maintenance,
          scopeItems: existingScope,
          tone,
        },
      });

      const scope = data?.scope || [];
      setGeneratedScope(scope);
      // Select all by default
      setSelectedItems(new Set(scope.map((_: string, i: number) => i)));
    } catch (err) {
      console.error("Scope generation error:", err);
      toast.error("Failed to generate scope. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = (index: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const applySelected = () => {
    const selected = generatedScope.filter((_, i) => selectedItems.has(i));
    onScopeGenerated(selected);
    toast.success(`Added ${selected.length} scope items`);
    setGeneratedScope([]);
  };

  if (generatedScope.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ECB22E]" />
            <span className="text-sm font-semibold">AI-Generated Scope ({selectedItems.size} selected)</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={generateScope} disabled={isGenerating}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Regenerate
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setGeneratedScope([])}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {generatedScope.map((item, i) => (
            <button
              key={i}
              onClick={() => toggleItem(i)}
              className={`w-full text-left p-3 rounded-xl border text-sm transition-all duration-200 ${
                selectedItems.has(i)
                  ? "border-[#2EB67D]/40 bg-[#2EB67D]/5"
                  : "border-border bg-background hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedItems.has(i) ? "bg-[#2EB67D] border-[#2EB67D]" : "border-border"
                }`}>
                  {selectedItems.has(i) && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="leading-relaxed">{item}</span>
              </div>
            </button>
          ))}
        </div>

        <Button onClick={applySelected} disabled={selectedItems.size === 0} className="w-full rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add {selectedItems.size} Scope Items
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <Select value={tone} onValueChange={(v) => setTone(v as ProposalTone)}>
        <SelectTrigger className="h-9 w-full sm:w-[180px] rounded-full text-sm">
          <SelectValue placeholder="Tone" />
        </SelectTrigger>
        <SelectContent>
          {PROPOSAL_TONES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              <div className="flex flex-col">
                <span className="font-medium">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={generateScope}
        disabled={isGenerating || !config.type}
        className="rounded-full gap-2"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-[#ECB22E]" />
        )}
        {isGenerating ? "Writing in human voice..." : "AI Generate Scope"}
      </Button>
    </div>
  );
}
