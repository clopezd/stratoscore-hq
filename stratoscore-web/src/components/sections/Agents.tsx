"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/SectionTag";
import { StratoscoreIcon } from "@/components/brand/StratoscoreIcon";

const ROLES = [
  "architect",
  "analyst",
  "copywriter",
  "reviewer",
  "security",
  "designer",
  "researcher",
  "operator",
  "sales",
  "support",
  "strategist",
] as const;

export function Agents() {
  const t = useTranslations("agents");
  const count = ROLES.length;

  return (
    <section id="agents" className="relative overflow-hidden py-32 sm:py-40">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,242,254,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <SectionTag>{t("tag")}</SectionTag>
          </div>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-white/60">{t("subtitle")}</p>
        </div>

        <div className="relative mx-auto mt-24 aspect-square w-full max-w-[720px]">
          <div
            aria-hidden
            className="absolute inset-[12%] rounded-full border border-dashed border-white/10"
          />
          <div
            aria-hidden
            className="absolute inset-[28%] rounded-full border border-dashed border-white/10"
          />

          <motion.div
            className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-400/30 bg-carbon-900/80 backdrop-blur"
            animate={{ boxShadow: ["0 0 30px -10px rgba(0,242,254,0.3)", "0 0 60px -10px rgba(0,242,254,0.6)", "0 0 30px -10px rgba(0,242,254,0.3)"] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <StratoscoreIcon size={52} animated />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          >
            {ROLES.map((role, i) => {
              const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
              const radius = 44;
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;
              return (
                <motion.div
                  key={role}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xs font-semibold tracking-tight text-white backdrop-blur transition-all group-hover:border-cyan-400/40 group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
                      {t(`roles.${role}`).slice(0, 2).toUpperCase()}
                    </div>
                    <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-white/50 transition-colors group-hover:text-cyan-300">
                      {t(`roles.${role}`)}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
