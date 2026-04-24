"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTag } from "@/components/ui/SectionTag";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StratoscoreIcon } from "@/components/brand/StratoscoreIcon";
import { RevealText } from "@/components/ui/RevealText";

export function FinalCTA() {
  const t = useTranslations("cta");

  return (
    <section id="cta" className="relative overflow-hidden py-32 sm:py-48">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(0,242,254,0.18) 0%, transparent 60%), radial-gradient(ellipse at 30% 20%, rgba(34,211,238,0.1) 0%, transparent 50%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30 mask-fade-b" />

      <div className="relative mx-auto max-w-5xl px-6 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex justify-center"
        >
          <StratoscoreIcon size={120} animated />
        </motion.div>

        <div className="mt-10 flex justify-center">
          <SectionTag>{t("tag")}</SectionTag>
        </div>

        <RevealText
          as="h2"
          text={t("title")}
          className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
          stagger={0.03}
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-8 max-w-xl text-lg text-white/60"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <MagneticButton href="mailto:hello@stratoscore.com" variant="primary">
            {t("button")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </MagneticButton>
          <p className="text-sm text-white/40">{t("secondary")}</p>
        </motion.div>
      </div>
    </section>
  );
}
