"use client";

import { useTranslations } from "next-intl";
import { RevealText } from "@/components/ui/RevealText";
import { SectionTag } from "@/components/ui/SectionTag";

export function Manifesto() {
  const t = useTranslations("manifesto");

  return (
    <section className="relative overflow-hidden py-32 sm:py-48">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(0,242,254,0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(34,211,238,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <SectionTag>{t("tag")}</SectionTag>

        <blockquote className="mt-10">
          <RevealText
            as="p"
            text={t("text")}
            className="text-balance text-[clamp(1.75rem,4.5vw,4rem)] font-medium leading-[1.1] tracking-[-0.03em] text-white"
            stagger={0.02}
          />
          <p className="mt-10 text-sm tracking-wide text-white/40">
            {t("signature")}
          </p>
        </blockquote>
      </div>
    </section>
  );
}
