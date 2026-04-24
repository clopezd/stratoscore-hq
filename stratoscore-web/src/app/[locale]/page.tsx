import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Clients } from "@/components/sections/Clients";
import { Capabilities } from "@/components/sections/Capabilities";
import { Agents } from "@/components/sections/Agents";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { Numbers } from "@/components/sections/Numbers";
import { Stack } from "@/components/sections/Stack";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Manifesto />
      <Clients />
      <Capabilities />
      <Agents />
      <CaseStudy />
      <Numbers />
      <Stack />
      <FinalCTA />
    </>
  );
}
