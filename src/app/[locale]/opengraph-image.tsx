import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";

export const alt = `${siteConfig.name} | Creative digital agency`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The four discipline hues, in service order. */
const HUES = ["#FFB020", "#2563FF", "#FF5A5F", "#14B87C"];

/** Default Open Graph image: light, typographic and on-brand, with the
 * headline and tagline translated per locale. */
export default async function OpengraphImage() {
  const dict = await getDictionary();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #ffffff 0%, #f4f7fd 100%)",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", color: "#0B45FF" }}>MTC</div>
          <div style={{ display: "flex", gap: 12 }}>
            {HUES.map((hue) => (
              <div key={hue} style={{ width: 22, height: 22, borderRadius: 6, background: hue }} />
            ))}
          </div>
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: "-0.04em",
            color: "#0B1222",
            maxWidth: 940,
          }}
        >
          {dict.meta.ogHeadline}
        </div>
        <div style={{ fontSize: 26, color: "#4A5468", maxWidth: 900 }}>{dict.meta.tagline}</div>
      </div>
    ),
    { ...size },
  );
}
