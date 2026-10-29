import type { StudioContent } from "../types";

/**
 * Studio (/studio) singleton content (English; translations live in the
 * overlays in src/content/i18n). Not admin-managed: this file ships with the
 * site. Kept short on purpose, and limited to what the live site states.
 */
export const studio: StudioContent = {
  intro: {
    label: "Studio",
    headline: ["A creative and", "digital studio."],
    supporting: "We build brands, digital products and the content that carries them.",
  },
  about: {
    label: "The studio",
    body: [
      "MTC brings branding, web, social media and content together under one roof. One team is accountable for the whole result, not a chain of separate vendors.",
      "Strategy shapes the brand, the brand shapes the website, and the website gives your content somewhere to live. Each discipline makes the next one stronger.",
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
        body: "Say less, mean more. Every choice has a reason behind it.",
      },
      {
        id: "strategy",
        title: "Strategy first",
        body: "We settle the positioning before the first design decision.",
      },
      {
        id: "creativity",
        title: "Creative always",
        body: "Work that earns attention instead of filling space.",
      },
      {
        id: "execution",
        title: "Built to ship",
        body: "Designed and made to hold up in the real world.",
      },
    ],
  },
  seo: {
    seoTitle: "Studio | MTC",
    metaDescription:
      "MTC is a creative and digital studio: branding, web and app development, social media and content, built as one system.",
    noindex: false,
  },
};
