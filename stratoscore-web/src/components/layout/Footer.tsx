"use client";

import { useTranslations } from "next-intl";
import { StratoscoreWordmark } from "@/components/brand/StratoscoreWordmark";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const sections = [
    {
      title: t("sections.product"),
      links: [
        { href: "#capabilities", label: t("links.capabilities") },
        { href: "#cases", label: t("links.cases") },
        { href: "#agents", label: t("links.agents") },
      ],
    },
    {
      title: t("sections.company"),
      links: [
        { href: "#", label: t("links.about") },
        { href: "mailto:hello@stratoscore.com", label: t("links.contact") },
      ],
    },
    {
      title: t("sections.legal"),
      links: [
        { href: "#", label: t("links.privacy") },
        { href: "#", label: t("links.security") },
        { href: "#", label: t("links.terms") },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/5 bg-carbon-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <StratoscoreWordmark size="lg" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
            {t("tagline")}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/40">
            {t("location")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                {s.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:px-8">
          <span>
            © {year} StratosCore · {t("rights")}
          </span>
          <span className="font-mono uppercase tracking-[0.2em]">
            v4.0 · Made with AI in Medellín
          </span>
        </div>
      </div>
    </footer>
  );
}
