"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/SectionTag";

const ITEMS = [
  {
    key: "platforms",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 9l2 2 2-2M13 9l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "automation",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19 5l-3 3M8 16l-3 3M19 19l-3-3M8 8 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "agents",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "intelligence",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 20V4M3 20h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 16l4-6 3 4 5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="6" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
] as const;

export function Capabilities() {
  const t = useTranslations("capabilities");

  return (
    <section id="capabilities" className="relative py-32 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="max-w-3xl">
          <SectionTag>{t("tag")}</SectionTag>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-white/60">{t("subtitle")}</p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ITEMS.map((item, i) => (
            <motion.article
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 transition-all hover:border-cyan-400/30 sm:p-10"
              data-cursor="hover"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
              />

              <div className="relative flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-cyan-300">
                  {item.icon}
                </div>
                <span className="text-xs font-mono text-white/30">
                  0{i + 1}
                </span>
              </div>

              <h3 className="relative mt-8 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {t(`items.${item.key}.title`)}
              </h3>
              <p className="relative mt-4 text-base leading-relaxed text-white/60">
                {t(`items.${item.key}.description`)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
