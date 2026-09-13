import type { HomepageContent } from "../types";

/**
 * Homepage singleton content. Seeded now so sections built in later
 * stages read from here (and, eventually, from the same shape in
 * Supabase) rather than hard-coding copy.
 */
export const homepageContent: HomepageContent = {
  hero: {
    label: "Creative digital agency",
    headline: ["We build brands.", "We create digital.", "We make ideas move."],
    supporting:
      "MTC combines strategy, creative direction, technology and marketing to build brands and digital experiences that get noticed.",
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "View our work", href: "/work" },
  },
  intro: {
    label: "What we do",
    statement:
      "We build brands, digital experiences and campaigns that make businesses impossible to ignore.",
    body: "MTC brings branding, digital experiences, social media, marketing, content and advertising together under one roof — working as a single system instead of six separate vendors.",
  },
  services: {
    label: "Our services",
    headline: "Everything your brand needs to move forward.",
    supporting: "Four disciplines. One accountable team.",
  },
  approach: {
    label: "The MTC approach",
    headline: ["Strategy first.", "Creative always.", "Built to perform."],
  },
  whyPoints: [
    {
      id: "think",
      title: "Think",
      body: "Strategy, research and positioning — settled before a single execution decision gets made.",
    },
    {
      id: "make",
      title: "Make",
      body: "Branding, design, content and digital experiences, built with intention.",
    },
    {
      id: "move",
      title: "Move",
      body: "Launch, distribute, advertise, measure — and keep improving.",
    },
  ],
  howWeWork: {
    label: "How we work",
    headline: "From first idea to real-world impact.",
    supporting: "Four stages. One continuous system.",
  },
  process: [
    {
      id: "discover",
      number: "01",
      title: "Discover",
      body: "Understand the business, audience, goals and opportunity.",
    },
    {
      id: "define",
      number: "02",
      title: "Define",
      body: "Build the strategy, positioning, creative direction and plan.",
    },
    {
      id: "create",
      number: "03",
      title: "Create",
      body: "Design, develop and produce the brand, digital experience and content.",
    },
    {
      id: "launch",
      number: "04",
      title: "Launch",
      body: "Launch the work, distribute it, advertise it and learn from the results.",
    },
  ],
  stats: [
    {
      id: "campaigns",
      value: "+120",
      label: "Campaigns launched",
      note: "Placeholder — replace with a verified figure before publishing.",
    },
    {
      id: "projects",
      value: "+80",
      label: "Brands & digital projects",
      note: "Placeholder — replace with a verified figure before publishing.",
    },
    {
      id: "impressions",
      value: "+45M",
      label: "Impressions generated",
      note: "Placeholder — replace with a verified figure before publishing.",
    },
    {
      id: "roas",
      value: "3.8x",
      label: "Average campaign ROAS",
      note: "Placeholder — replace with a verified figure before publishing.",
    },
  ],
  testimonialsIntro: {
    label: "What clients say",
    headline: "Good work is remembered.",
    supporting: "A few words from people we've worked with.",
  },
  finalCta: {
    headline: "Have a project in mind?",
    supporting: "Let's build something worth noticing.",
    primaryCta: { label: "Start a project", href: "/contact" },
  },
  seo: {
    seoTitle: "MTC — Creative digital agency",
    metaDescription:
      "Branding, web & app development, social media, and content — strategy first, creative always, technology where it matters.",
    noindex: false,
  },
};
