import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#001117",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 80 80" fill="none">
          <defs>
            <linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <polygon points="40,8 68,22 40,36 12,22" fill="url(#t)" />
          <polygon points="12,22 40,36 40,72 12,58" fill="#0e7490" />
          <polygon points="68,22 40,36 40,72 68,58" fill="#155e75" />
        </svg>
      </div>
    ),
    size,
  );
}
