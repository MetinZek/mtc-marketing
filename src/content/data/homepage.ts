import type { HomepageContent } from "../types";

/**
 * Homepage singleton content (English; German and Swedish come from the
 * overlays in src/content/i18n). Not admin-managed: this file ships with the
 * site. Copy rewritten for the redesign; every claim here is either a
 * description of MTC's own services and process or taken from the live site.
 */
export const homepageContent: HomepageContent = {
  hero: {
    label: "Creative digital agency",
    headline: ["We make brands", "impossible to ignore."],
    supporting:
      "Branding, websites, social media and content from one creative team, from the first idea to launch day.",
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "See our work", href: "/work" },
  },
  intro: {
    label: "Why one team",
    statement:
      "One team for the whole job: the brand, the website, the content and the campaigns that carry it.",
    body: "Fewer handoffs, one standard, and work that fits together because the same people made it.",
  },
  services: {
    label: "What we do",
    headline: "One team. Four disciplines.",
    supporting:
      "Most projects draw on more than one, so your brand, website and campaigns look and sound like they belong together.",
  },
  approach: {
    label: "The MTC approach",
    headline: ["Strategy first.", "Creative always.", "Built to perform."],
  },
  whyPoints: [
    {
      id: "think",
      title: "Think",
      body: "Strategy, research and positioning, settled before a single design decision.",
    },
    {
      id: "make",
      title: "Make",
      body: "Branding, design, content and digital experiences, built with intention.",
    },
    {
      id: "move",
      title: "Move",
      body: "Launch, distribute, advertise and measure, then keep improving.",
    },
  ],
  howWeWork: {
    label: "How we work",
    headline: "A clear process, from first call to launch.",
    supporting: "Four stages, and one team with you the whole way through.",
  },
  process: [
    {
      id: "discover",
      number: "01",
      title: "Discover",
      body: "We learn your business, your audience and what success should look like.",
    },
    {
      id: "define",
      number: "02",
      title: "Define",
      body: "We set the strategy, positioning and creative direction, and agree on a plan.",
    },
    {
      id: "create",
      number: "03",
      title: "Create",
      body: "We design, build and produce the brand, the website and the content.",
    },
    {
      id: "launch",
      number: "04",
      title: "Launch",
      body: "We launch, promote and measure the work, then keep improving what performs.",
    },
  ],
  // No verified figures exist, so no statistics are published anywhere.
  stats: [],
  testimonialsIntro: {
    label: "Client words",
    headline: "What our clients say.",
  },
  finalCta: {
    headline: "Have a project in mind?",
    supporting: "Pick what you need and we'll take it from there.",
    primaryCta: { label: "Start a project", href: "/contact" },
  },
  seo: {
    seoTitle: "MTC | Creative digital agency in Mitrovica, Kosovo",
    metaDescription:
      "MTC is a creative digital agency for branding, websites, social media and content. One team, from the first idea to launch day.",
    noindex: false,
  },
};
