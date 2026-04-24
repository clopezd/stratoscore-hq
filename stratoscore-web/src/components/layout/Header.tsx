"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { StratoscoreWordmark } from "@/components/brand/StratoscoreWordmark";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/cn";

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#capabilities", label: t("capabilities") },
    { href: "#agents", label: t("agents") },
    { href: "#cases", label: t("cases") },
    { href: "#stack", label: t("stack") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-6",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 transition-all duration-500 sm:px-8",
          scrolled &&
            "rounded-full border border-white/10 bg-carbon-950/70 px-4 py-2.5 backdrop-blur-xl sm:px-5 max-w-6xl",
        )}
      >
        <a href="#" className="flex items-center" aria-label="StratosCore">
          <StratoscoreWordmark size="sm" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher className="hidden sm:inline-flex" />
          <a
            href="#cta"
            className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-carbon-900 transition-colors hover:bg-cyan-300 sm:inline-block"
          >
            {t("cta")}
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-4 top-full mt-3 rounded-2xl border border-white/10 bg-carbon-950/95 p-6 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col gap-4" aria-label="Mobile">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-white/80"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <LocaleSwitcher />
                <a
                  href="#cta"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-carbon-900"
                >
                  {t("cta")}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
