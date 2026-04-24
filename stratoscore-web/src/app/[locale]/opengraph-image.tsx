import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "StratosCore";

export default async function OG({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(0,242,254,0.25) 0%, transparent 60%), linear-gradient(180deg, #000a0e 0%, #001117 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="52" height="52" viewBox="0 0 80 80">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <polygon points="40,8 68,22 40,36 12,22" fill="url(#g)" />
            <polygon points="12,22 40,36 40,72 12,58" fill="#0e7490" />
            <polygon points="68,22 40,36 40,72 68,58" fill="#155e75" />
          </svg>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>
            <span>stratos</span>
            <span style={{ color: "#22d3ee" }}>core</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 78, fontWeight: 600, letterSpacing: -2.5, lineHeight: 1, maxWidth: 1000 }}>
            {t("title").split("—")[0].trim()}
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.65)", maxWidth: 900, lineHeight: 1.3 }}>
            {t("description")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
