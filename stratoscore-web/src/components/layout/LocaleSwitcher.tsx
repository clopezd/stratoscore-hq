"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");
  const [pending, start] = useTransition();

  const switchTo = (next: "es" | "en") => {
    if (next === locale) return;
    start(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs backdrop-blur",
        className,
        pending && "opacity-60",
      )}
      role="group"
      aria-label={t("label")}
    >
      {(["es", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={locale === code}
          className={cn(
            "px-3 py-1 rounded-full font-medium uppercase tracking-[0.15em] transition-colors",
            locale === code
              ? "bg-cyan-400 text-carbon-900"
              : "text-white/60 hover:text-white",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
