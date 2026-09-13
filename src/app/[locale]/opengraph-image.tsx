import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";

export const alt = `${siteConfig.name} — Creative digital agency`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph image. Light, typographic, on-brand — headline and
 * tagline translated per locale, brand name/colours unchanged. */
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
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#1D4BFF",
          }}
        >
          MTC
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#17191E",
            maxWidth: 900,
          }}
        >
          {dict.meta.ogHeadline}
        </div>
        <div style={{ fontSize: 26, color: "#5C606B" }}>{dict.meta.tagline}</div>
      </div>
    ),
    { ...size },
  );
}
