import type { StudioContent } from "../types";

/**
 * Studio (/studio) singleton content. Seeded here now so the page reads
 * from the CMS layer like every other route; the Supabase provider will
 * return an editable version of this same shape. Keep it short — the
 * page is deliberately low on copy.
 */
export const studio: StudioContent = {
  intro: {
    label: "Studio",
    headline: ["We are a", "creative and", "digital studio."],
    supporting:
      "We build brands, digital products, and the content that carries them.",
  },
  about: {
    label: "The studio",
    body: [
      "MTC brings branding, digital and content together under one roof — one team accountable for the whole, not a chain of separate vendors.",
      "Strategy shapes the brand, the brand shapes the product, and the product gives content somewhere to live. Each discipline sharpens the next.",
    ],
  },
  capabilities: {
    label: "Capabilities",
    supporting: "Four disciplines, working as one.",
  },
  principles: {
    label: "Principles",
    items: [
      {
        id: "clarity",
        title: "Clarity",
        body: "Say less, mean more — every choice has a reason behind it.",
      },
      {
        id: "strategy",
        title: "Strategy first",
        body: "Positioning is settled before the first execution decision.",
      },
      {
        id: "creativity",
        title: "Creative always",
        body: "Work that earns attention rather than filling space.",
      },
      {
        id: "execution",
        title: "Built to ship",
        body: "Designed and made to hold up in the real world.",
      },
    ],
  },
  seo: {
    seoTitle: "Studio — MTC",
    metaDescription:
      "MTC is a creative and digital studio — branding, web & app development, social, and content, built as one system.",
    noindex: false,
  },
};
