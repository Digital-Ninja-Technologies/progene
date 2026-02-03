import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-sm" },
    md: { icon: 28, text: "text-base" },
    lg: { icon: 40, text: "text-xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Background rounded square */}
        <rect width="40" height="40" rx="10" className="fill-primary" />
        
        {/* Overlapping document shapes - Slack-inspired */}
        {/* Back document */}
        <rect
          x="10"
          y="8"
          width="14"
          height="18"
          rx="2"
          className="fill-primary-foreground/40"
        />
        
        {/* Front document */}
        <rect
          x="16"
          y="14"
          width="14"
          height="18"
          rx="2"
          className="fill-primary-foreground"
        />
        
        {/* Document lines on front */}
        <rect
          x="19"
          y="19"
          width="8"
          height="2"
          rx="1"
          className="fill-primary/60"
        />
        <rect
          x="19"
          y="23"
          width="6"
          height="2"
          rx="1"
          className="fill-primary/40"
        />
        <rect
          x="19"
          y="27"
          width="7"
          height="2"
          rx="1"
          className="fill-primary/40"
        />
      </svg>
      
      {showText && (
        <span className={cn("font-semibold tracking-tight", text)}>
          ScopeGen
        </span>
      )}
    </div>
  );
}
