import { PROJECT_TYPES, ProjectType } from "@/types/project";
import { cn } from "@/lib/utils";
import { Check, Lightbulb } from "lucide-react";

interface ProjectTypeStepProps {
  selectedType: ProjectType | null;
  onSelect: (type: ProjectType) => void;
}

export function ProjectTypeStep({ selectedType, onSelect }: ProjectTypeStepProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold sm:text-3xl mb-3">
          What type of project is this?
        </h2>
        <p className="text-muted-foreground">
          Pick what's closest — you can edit everything later. Don't see your category? Choose the nearest match.
        </p>
      </div>

      <div className="mx-auto max-w-2xl flex items-start gap-3 rounded-2xl border border-[#ECB22E]/30 bg-[#ECB22E]/5 p-4 text-sm">
        <Lightbulb className="h-4 w-4 text-[#ECB22E] mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold">First time?</span>{" "}
          <span className="text-muted-foreground">
            This wizard takes about 3 minutes. We'll ask 5 simple questions, then generate a complete proposal you can edit.
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onSelect(type.value)}
            className={cn(
              "group relative flex flex-col items-start p-6 rounded-2xl border transition-all duration-200 text-left",
              selectedType === type.value
                ? "border-foreground bg-muted"
                : "border-border hover:border-foreground/50 hover:bg-muted/50"
            )}
          >
            <span className="text-3xl mb-4">{type.icon}</span>
            <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
            <p className="text-sm text-muted-foreground">{type.description}</p>
            {selectedType === type.value && (
              <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-foreground">
                <Check className="h-4 w-4 text-background" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
