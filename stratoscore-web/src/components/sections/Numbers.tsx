"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/SectionTag";

const KEYS = ["speed", "cost", "uptime", "security"] as const;

export function Numbers() {
  const t = useTranslations("numbers");

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-gradient-to-b from-carbon-950 via-carbon-900 to-carbon-950 py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade-b"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div className="max-w-2xl">
          <SectionTag>{t("tag")}</SectionTag>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] lg:grid-cols-4">
          {KEYS.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col gap-3 bg-carbon-950 p-10"
            >
              <div className="text-[clamp(3rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em] text-gradient-cyan">
                {t(`items.${key}.value`)}
              </div>
              <div className="mt-2 text-sm leading-snug text-white/60">
                {t(`items.${key}.label`)}
              </div>
              <div
                aria-hidden
                className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-cyan-400 to-transparent transition-transform duration-700 group-hover:scale-x-100"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
