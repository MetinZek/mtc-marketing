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
    headline: ["Oh look,", "you found us"],
    supporting: "Creative thinking. Digital doing.",
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "See our work", href: "/work" },
  },
  intro: {
    label: "Why one team",
    statement:
      "From the way your business looks to the way it works and gets noticed, everything comes together under one roof.",
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
      body: "We get to know your business, your goals and the people you want to reach.",
    },
    {
      id: "define",
      number: "02",
      title: "Define",
      body: "We figure out the direction, build the plan and get everyone on the same page.",
    },
    {
      id: "create",
      number: "03",
      title: "Create",
      body: "From the visuals to the website and content, we bring the pieces together.",
    },
    {
      id: "launch",
      number: "04",
      title: "Launch",
      body: "We put it out there, see what works and keep making it better.",
    },
  ],
  // No verified figures exist, so no statistics are published anywhere.
  stats: [],
  testimonialsIntro: {
    label: "Client words",
    headline: "In Our Clients’ Words.",
  },
  finalCta: {
    headline: "Have a project in mind?",
    supporting: "Pick what you need and we'll take it from there.",
    primaryCta: { label: "Start a project", href: "/contact" },
  },
  seo: {
    seoTitle: "MTC | Creative digital agency",
    metaDescription:
      "MTC is a creative digital agency for branding, websites, social media and content. One team, from the first idea to launch day.",
    noindex: false,
  },
};
