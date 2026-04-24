import { cn } from "@/lib/cn";

export function SectionTag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px] shadow-cyan-400" />
      {children}
    </div>
  );
}
