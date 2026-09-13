/**
 * English UI-chrome strings — the source of truth. `de.ts`/`sv.ts` are
 * typed against `Dictionary` (inferred from this file) so a missing or
 * mistyped key in either is a compile error, not a silent fallback.
 * CMS-authored content (service/project/post copy, etc.) is translated
 * separately via the overlay in src/content/i18n — this file only covers
 * text that's hardcoded directly in components.
 */
export const en = {
  meta: {
    /** "{title} — Creative digital agency" — used as the default <title>. */
    titleSuffix: "Creative digital agency",
    tagline: "A creative digital agency — brand, product, and marketing under one roof.",
    description:
      "MTC is a creative digital agency combining branding, web & app development, social media, and content — strategy first, creative always, technology where it matters.",
    ogHeadline: "Building brands. Shipping products. Making ideas move.",
  },
  nav: {
    logoAriaLabel: "MTC — home",
    primaryAriaLabel: "Primary",
    primaryMobileAriaLabel: "Primary (mobile)",
    work: "Work",
    services: "Services",
    studio: "Studio",
    journal: "Journal",
    startAProject: "Start a project",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    languageSwitcherAriaLabel: "Language",
  },
  footer: {
    contactHeading: "Contact",
    exploreHeading: "Explore",
    legalHeading: "Legal",
    contactLabel: "Contact",
    privacyPolicy: "Privacy Policy",
    termsAndConditions: "Terms & Conditions",
    cookiePolicy: "Cookie Policy",
    allRightsReserved: "All rights reserved.",
    placeholderDisclaimer: "Let’s create something that matters.",
  },
  contactForm: {
    nameRequired: "Please enter your name.",
    emailRequired: "Please enter your email.",
    emailInvalid: "Please enter a valid email address.",
    phoneInvalid: "Please enter a valid phone number.",
    messageRequired: "Please enter at least 20 characters.",
    successLabel: "Message sent",
    successMessage: "Thanks. We'll be in touch.",
    nameLabel: "Name",
    emailLabel: "Email",
    companyLabel: "Company",
    phoneLabel: "Phone",
    serviceLabel: "Service",
    messageLabel: "Message",
    optionalSuffix: "(optional)",
    selectServicePlaceholder: "Select a service",
    messagePlaceholder: "A sentence or two about the project.",
    sending: "Sending…",
    send: "Send message",
    sendFailure: "We couldn't send your message just now. Please try again shortly.",
  },
  services: {
    toggleExpandLabel: "{title} — expand",
    toggleCollapseLabel: "{title} — collapse",
  },
  home: {
    selectedWorkEyebrow: "Selected work",
    selectedWorkHeadlineLine1: "Selected work.",
    selectedWorkHeadlineLine2: "Built to be seen.",
    trustedClientsAriaLabel: "Trusted clients",
    trustedByLabel: "Trusted by",
  },
  work: {
    eyebrow: "Selected work",
    title: "Work.",
    projectCountOne: "project",
    projectCountOther: "projects",
    viewCaseStudy: "View case study",
    viewCaseStudyAriaLabel: "View case study: {title}",
    metaTitle: "Work — MTC",
    metaDescription:
      "Selected projects from MTC — branding, digital product, campaign and content work.",
    metaTitleSuffix: "Work",
    backToWork: "Work",
  },
  projectDetail: {
    client: "Client",
    servicesLabel: "Services",
    year: "Year",
    category: "Category",
    outcomes: "Outcomes",
    moreProjects: "More projects",
    viewAll: "View all",
  },
  journal: {
    title: "Journal",
    supporting: "Notes on brand, product and the work in between.",
    entryCountOne: "entry",
    entryCountOther: "entries",
    readArticle: "Read article",
    read: "Read",
    previous: "Previous",
    next: "Next",
    metaTitle: "Journal — MTC",
    metaDescription: "Notes on brand, product and the work in between — from the MTC studio.",
    metaTitleSuffix: "Journal",
  },
  contactPage: {
    metaTitle: "Contact — MTC",
    metaDescription:
      "Tell us about the project. MTC is a creative and digital studio — brand, product and content under one roof.",
    eyebrow: "Contact",
    title: "Let's talk.",
    supporting: "Tell us what you're working on — the more context, the better.",
    direct: "Direct",
  },
  notFound: {
    errorLabel: "Error 404",
    title: "Page not found",
    body: "The page you were looking for doesn't exist or has moved.",
    backToHome: "Back to home",
    viewOurWork: "View our work",
    homeAriaLabel: "MTC home",
  },
  misc: {
    skipToContent: "Skip to content",
  },
  carousel: {
    previousTestimonial: "Previous testimonial",
    nextTestimonial: "Next testimonial",
    theTeam: "The team",
    previousTeamMembers: "Previous team members",
    nextTeamMembers: "Next team members",
  },
};

export type Dictionary = typeof en;
