import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = "md", label = "Loading...", className }: LoadingSpinnerProps) {
  const dotSize = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }[size];

  const gap = {
    sm: "gap-1.5",
    md: "gap-2",
    lg: "gap-3",
  }[size];

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className={cn("flex items-center", gap)}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              dotSize,
              "rounded-full bg-primary/80",
              "animate-[bounce_1.4s_ease-in-out_infinite]"
            )}
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
      {label && (
        <p className="mt-4 text-sm text-muted-foreground animate-fade-in">{label}</p>
      )}
    </div>
  );
}
