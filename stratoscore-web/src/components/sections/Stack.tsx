"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/SectionTag";

const STACK = {
  frontend: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Framer Motion", "Three.js"],
  backend: ["Node.js", "Supabase", "PostgreSQL", "tRPC", "Zod", "Edge Functions"],
  ai: ["Claude 4.7", "OpenAI", "Vercel AI SDK", "LangChain", "Vector DB", "Embeddings"],
  infra: ["Vercel", "Cloudflare", "Stripe", "Resend", "Sentry", "GitHub Actions"],
} as const;

export function Stack() {
  const t = useTranslations("stack");

  return (
    <section id="stack" className="relative py-32 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="max-w-3xl">
          <SectionTag>{t("tag")}</SectionTag>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-white/60">{t("subtitle")}</p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] md:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(STACK) as Array<keyof typeof STACK>).map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative bg-carbon-950 p-8"
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                {t(`categories.${cat}`)}
              </h3>
              <ul className="mt-6 space-y-3">
                {STACK[cat].map((tool) => (
                  <li
                    key={tool}
                    className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-white/30 transition-colors group-hover:bg-cyan-400" />
                    {tool}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
