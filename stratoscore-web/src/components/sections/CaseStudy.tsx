"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/SectionTag";
import { MagneticButton } from "@/components/ui/MagneticButton";

const METRICS = ["speed", "accuracy", "savings"] as const;

export function CaseStudy() {
  const t = useTranslations("case");

  return (
    <section id="cases" className="relative py-32 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionTag>{t("tag")}</SectionTag>
            <p className="mt-6 text-lg font-medium tracking-tight text-cyan-300">
              {t("client")}
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-white/60">
              {t("body")}
            </p>

            <div className="mt-12">
              <MagneticButton href="#cta" variant="ghost">
                {t("cta")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </MagneticButton>
            </div>
          </motion.div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon-800 via-carbon-900 to-carbon-950 p-8 sm:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl"
              />

              <div className="relative flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/40">
                  Forecast ML · live
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">active</span>
                </div>
              </div>

              <div className="relative mt-8 h-44 w-full">
                <svg viewBox="0 0 400 160" className="h-full w-full" aria-hidden>
                  <defs>
                    <linearGradient id="caseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0 120 L 40 100 L 80 110 L 120 80 L 160 90 L 200 60 L 240 70 L 280 40 L 320 50 L 360 20 L 400 30 L 400 160 L 0 160 Z"
                    fill="url(#caseFill)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                  <motion.path
                    d="M0 120 L 40 100 L 80 110 L 120 80 L 160 90 L 200 60 L 240 70 L 280 40 L 320 50 L 360 20 L 400 30"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </div>

              <div className="relative mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                {METRICS.map((key, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
                  >
                    <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {t(`metrics.${key}.value`)}
                    </div>
                    <div className="mt-1.5 text-[11px] leading-snug text-white/50">
                      {t(`metrics.${key}.label`)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
