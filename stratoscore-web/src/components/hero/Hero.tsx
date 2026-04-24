"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { RevealText } from "@/components/ui/RevealText";

const CubeScene = dynamic(
  () => import("./CubeScene").then((m) => m.CubeScene),
  { ssr: false },
);

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="bg-noise" aria-hidden />

      <div className="absolute inset-0 -z-10" aria-hidden>
        <CubeScene />
      </div>

      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,242,254,0.12) 0%, transparent 55%), linear-gradient(to bottom, transparent 60%, rgba(0,10,14,0.85) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-32 pb-28 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium tracking-[0.18em] text-white/70 uppercase backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          {t("eyebrow")}
        </motion.div>

        <h1 className="max-w-5xl text-[clamp(2.5rem,8vw,7rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
          <RevealText as="span" text={t("titleLine1")} className="block text-white" delay={0.3} />
          <RevealText
            as="span"
            text={t("titleLine2")}
            className="block text-gradient"
            delay={0.55}
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-2xl text-lg text-white/70 sm:text-xl"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="#cta" variant="primary">
            {t("ctaPrimary")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <MagneticButton href="#capabilities" variant="ghost">
            {t("ctaSecondary")}
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/40"
        >
          <div className="flex flex-col items-center gap-2">
            <span>{t("scrollHint")}</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-8 w-[1px] bg-gradient-to-b from-cyan-400 to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
