import { cn } from "@/lib/cn";
import { StratoscoreIcon } from "./StratoscoreIcon";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { icon: 22, text: "text-base" },
  md: { icon: 30, text: "text-lg" },
  lg: { icon: 40, text: "text-2xl" },
};

export function StratoscoreWordmark({ className, size = "md" }: Props) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <StratoscoreIcon size={s.icon} />
      <span
        className={cn(
          s.text,
          "font-semibold tracking-tight leading-none select-none",
        )}
      >
        <span className="text-white">stratos</span>
        <span className="text-cyan-400">core</span>
      </span>
    </div>
  );
}
