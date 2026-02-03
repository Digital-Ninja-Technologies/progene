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
        {/* Slack-inspired colorful pinwheel of documents */}
        
        {/* Top-left document - Blue */}
        <rect
          x="4"
          y="4"
          width="14"
          height="18"
          rx="3"
          fill="#36C5F0"
        />
        <rect
          x="4"
          y="4"
          width="6"
          height="6"
          rx="3"
          fill="#36C5F0"
        />
        
        {/* Top-right document - Green */}
        <rect
          x="22"
          y="4"
          width="14"
          height="18"
          rx="3"
          fill="#2EB67D"
        />
        <rect
          x="30"
          y="4"
          width="6"
          height="6"
          rx="3"
          fill="#2EB67D"
        />
        
        {/* Bottom-left document - Yellow */}
        <rect
          x="4"
          y="18"
          width="14"
          height="18"
          rx="3"
          fill="#ECB22E"
        />
        <rect
          x="4"
          y="30"
          width="6"
          height="6"
          rx="3"
          fill="#ECB22E"
        />
        
        {/* Bottom-right document - Red/Pink */}
        <rect
          x="22"
          y="18"
          width="14"
          height="18"
          rx="3"
          fill="#E01E5A"
        />
        <rect
          x="30"
          y="30"
          width="6"
          height="6"
          rx="3"
          fill="#E01E5A"
        />
        
        {/* Center overlap - creates pinwheel effect */}
        <rect
          x="14"
          y="14"
          width="12"
          height="12"
          rx="2"
          fill="white"
        />
        
        {/* Center document icon */}
        <rect
          x="16"
          y="16"
          width="8"
          height="8"
          rx="1.5"
          fill="#611f69"
        />
        <rect
          x="18"
          y="18"
          width="4"
          height="1"
          rx="0.5"
          fill="white"
          opacity="0.8"
        />
        <rect
          x="18"
          y="20"
          width="3"
          height="1"
          rx="0.5"
          fill="white"
          opacity="0.6"
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
