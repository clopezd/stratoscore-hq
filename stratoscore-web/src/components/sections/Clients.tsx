"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/SectionTag";

const KEYS = ["videndum", "mobility", "bidhunter", "medcare", "totalcom"] as const;

export function Clients() {
  const t = useTranslations("clients");

  return (
    <section className="relative border-y border-white/5 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionTag>{t("tag")}</SectionTag>
            <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("title")}
            </h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] sm:grid-cols-3 lg:grid-cols-5">
          {KEYS.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col justify-between gap-8 bg-carbon-950 p-8 transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex h-10 items-center">
                <span className="text-xl font-semibold tracking-tight text-white/90 transition-colors group-hover:text-cyan-300">
                  {t(`items.${key}.name`)}
                </span>
              </div>
              <div className="text-xs leading-relaxed text-white/50">
                {t(`items.${key}.sector`)}
              </div>
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent transition-transform duration-500 group-hover:scale-x-100"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
