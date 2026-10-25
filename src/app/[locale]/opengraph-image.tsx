import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";

export const alt = `${siteConfig.name} | Creative digital agency`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph image: white, typographic and monochrome like the
 * site, with the headline and tagline translated per locale and the
 * logo's blue as the only colour. */
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
          background: "#ffffff",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", color: "#0B45FF" }}>MTC</div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            color: "#1D1D1F",
            maxWidth: 980,
          }}
        >
          {dict.meta.ogHeadline}
        </div>
        <div style={{ fontSize: 26, color: "#6E6E73", maxWidth: 900 }}>{dict.meta.tagline}</div>
      </div>
    ),
    { ...size },
  );
}
