import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  className?: string;
  animated?: boolean;
};

export function StratoscoreIcon({ size = 40, className, animated = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && "animate-float", className)}
      aria-label="StratosCore"
      role="img"
    >
      <defs>
        <linearGradient id="sc-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="sc-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="sc-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00c4cc" />
          <stop offset="100%" stopColor="#155e75" />
        </linearGradient>
        <filter id="sc-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#sc-glow)">
        <polygon points="40,8 68,22 40,36 12,22" fill="url(#sc-top)" />
        <polygon points="12,22 40,36 40,72 12,58" fill="url(#sc-left)" />
        <polygon points="68,22 40,36 40,72 68,58" fill="url(#sc-right)" />

        <line x1="40" y1="36" x2="40" y2="72" stroke="#a5f3fc" strokeWidth="0.6" opacity="0.6" />
        <line x1="40" y1="36" x2="12" y2="22" stroke="#a5f3fc" strokeWidth="0.6" opacity="0.6" />
        <line x1="40" y1="36" x2="68" y2="22" stroke="#a5f3fc" strokeWidth="0.6" opacity="0.6" />
      </g>
    </svg>
  );
}
