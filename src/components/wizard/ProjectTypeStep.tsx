import { PROJECT_TYPES, ProjectType } from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectTypeStepProps {
  selectedType: ProjectType | null;
  onSelect: (type: ProjectType) => void;
}

export function ProjectTypeStep({ selectedType, onSelect }: ProjectTypeStepProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl mb-2">
          What type of project is this?
        </h2>
        <p className="text-muted-foreground">
          Select the project type that best matches your client's needs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onSelect(type.value)}
            className={cn(
              "group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left",
              selectedType === type.value
                ? "border-accent bg-accent/5 shadow-glow"
                : "border-border hover:border-accent/50 hover:bg-muted/50"
            )}
          >
            <span className="text-3xl mb-3">{type.icon}</span>
            <h3 className="font-display font-semibold text-lg mb-1">{type.label}</h3>
            <p className="text-sm text-muted-foreground">{type.description}</p>
            {selectedType === type.value && (
              <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full accent-gradient">
                <svg
                  className="h-4 w-4 text-accent-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
