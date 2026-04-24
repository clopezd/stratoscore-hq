"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
};

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });
  const rotateX = useTransform(sy, [-20, 20], [6, -6]);
  const rotateY = useTransform(sx, [-20, 20], [-6, 6]);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * 0.35);
    y.set(relY * 0.35);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const styles = cn(
    "relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium tracking-tight will-change-transform select-none",
    variant === "primary"
      ? "bg-cyan-400 text-carbon-900 hover:bg-cyan-300 shadow-[0_0_40px_-10px_rgba(0,242,254,0.6)]"
      : "bg-white/5 text-white border border-white/15 hover:bg-white/10 backdrop-blur",
    className,
  );

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy, rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="inline-block"
      data-cursor="hover"
    >
      {href ? (
        <a href={href} className={styles} onClick={onClick}>
          {children}
        </a>
      ) : (
        <button type="button" className={styles} onClick={onClick}>
          {children}
        </button>
      )}
    </motion.div>
  );

  return content;
}
