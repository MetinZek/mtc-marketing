import type { LocaleOverlay } from "./types";

/**
 * German CMS content overlay. Deep-merged over the English CMS result at
 * render time (src/lib/cms/localized.ts) — never edited via /admin.
 * Brand, project and person names stay untranslated by omission (those
 * fields aren't part of LocaleOverlay at all). Arrays merge over the English
 * array's length, so headline lines and paragraphs must match its count.
 * Journal posts are published in English only.
 */
export const de: LocaleOverlay = {
  services: {
    branding: {
      title: "Branding & visuelle Identität",
      summary:
        "Wir schaffen Marken, die man erkennt und sich merkt, von der ersten Idee bis zu einer visuellen Identität, die überall funktioniert.",
      capabilities: [
        "Markenstrategie & Positionierung",
        "Naming & Botschaften",
        "Logo & Identitätssysteme",
        "Art Direction & Guidelines",
        "Designsysteme für die Marke",
      ],
      ctaLabel: "Branding entdecken",
    },
    "web-app": {
      title: "Web- & App-Entwicklung",
      summary:
        "Websites und Web-Apps, rund um Ihr Unternehmen gebaut: reibungslos für Ihre Kunden und leicht zu pflegen, während Sie wachsen.",
      capabilities: [
        "UX- & UI-Design",
        "Next.js-/React-Entwicklung",
        "Headless-CMS-Integration",
        "Designsysteme & Komponenten",
        "Performance & Core Web Vitals",
      ],
      ctaLabel: "Entwicklung entdecken",
    },
    "social-marketing": {
      title: "Social Media & digitales Marketing",
      summary:
        "Inhalte und Kampagnen, die Ihr Unternehmen sichtbar machen, die richtigen Menschen erreichen und ihnen einen Grund zum Handeln geben.",
      capabilities: [
        "Kanal- & Content-Strategie",
        "Paid Social & Search",
        "Community-Management",
        "Analyse & Reporting",
        "Kampagnenoptimierung",
      ],
      ctaLabel: "Marketing entdecken",
    },
    "content-advertising": {
      title: "Content-Produktion & Werbung",
      summary:
        "Von Fotografie und Film bis zu Motion und Werbung: Wir schaffen Inhalte, die Ihre Ideen lebendig machen und Menschen einen Grund geben, hinzusehen.",
      capabilities: [
        "Kreativkonzepte",
        "Fotografie & Film",
        "Motion & Animation",
        "Copywriting",
        "Produktionsmanagement",
      ],
      ctaLabel: "Content entdecken",
    },
  },
  projects: {
    balkanbee: {
      category: "Branding & visuelle Identität",
      description:
        "BalkanBee ist ein Second-Hand-Marktplatz, der Käufer und Verkäufer auf dem ganzen Balkan verbindet: eine Plattform, viele Länder, keine Grenzen. Wir haben ihm eine passende Identität gegeben, mit einem Wabenzeichen rund um ein Paket, einer warmen Palette von Rot bis Bernstein und einer Stimme in drei Worten: „built for trade.“",
      services: ["Markenstrategie", "Logo & visuelle Identität", "Social Media"],
    },
    "as-med-healthcare-management-system": {
      category: "Web-App",
      description:
        "Ein maßgeschneidertes Gesundheitsmanagementsystem für AS-MED, das Patientenakten, klinische Dokumentation, ICD-10-Kodierung, Analysen und sichere Audit-Protokolle in einer Plattform vereint.",
      services: ["Web-App"],
    },
    "leo-gmbh": {
      category: "Webentwicklung & Wartung",
      description:
        "Eine moderne Website für ein Wiener Bau- und Renovierungsunternehmen, die die Leistungen, Projekte und Expertise der Leo GmbH klar präsentiert.",
      services: ["Webdesign", "Webentwicklung", "Responsive Design"],
    },
    "pixel-print": {
      category: "Branding & visuelle Identität",
      description:
        "Eine vollständige visuelle Identität für Pixel Print, aufgebaut auf einem markanten Logo, einem flexiblen Farbsystem und einem stimmigen Set an Markenanwendungen.",
      services: ["Markenstrategie", "Logodesign", "Visuelle Identität", "Markenanwendungen", "Printdesign"],
    },
    "summit-balkans": {
      category: "Branding & visuelle Identität",
      description:
        "Eine vollständige Markenidentität für Summit Balkans, eine Marke rund um Abenteuer, Entdeckung und die Natur des Balkans. Wir haben sie von Grund auf entwickelt: visuelle Identität, Logosystem, Typografie, Farbpalette und kreative Richtung, stimmig über digitale und physische Berührungspunkte hinweg.",
      services: ["Visuelle Identität", "Logosystem", "Typografie", "Farbpalette", "Kreative Richtung"],
    },
    "d12-construction-engineering-brand-identity": {
      category: "Branding & visuelle Identität",
      description:
        "Markenidentität und visuelle Richtung für D12 Construction & Engineering: eine moderne, strukturierte und unverwechselbare Identität, die den Fokus des Unternehmens auf Bau und Ingenieurwesen widerspiegelt.",
      services: ["Markenidentität", "Visuelle Richtung"],
    },
  },
  homepage: {
    hero: {
      label: "Kreative Digitalagentur",
      headline: ["Oh, Sie haben", "uns gefunden"],
      supporting: "Kreativ gedacht. Digital gemacht.",
      primaryCta: { label: "Projekt starten", href: "/contact" },
      secondaryCta: { label: "Unsere Arbeiten", href: "/work" },
    },
    intro: {
      label: "Warum ein Team",
      statement:
        "Wie Ihr Unternehmen aussieht, wie es funktioniert und wie es wahrgenommen wird: Alles kommt unter einem Dach zusammen.",
      body: "Weniger Übergaben, ein Anspruch und Arbeit, die zusammenpasst, weil sie von denselben Menschen kommt.",
    },
    services: {
      label: "Was wir tun",
      headline: "Ein Team. Vier Disziplinen.",
      supporting:
        "Die meisten Projekte brauchen mehr als eine, damit Marke, Website und Kampagnen aussehen und klingen, als gehörten sie zusammen.",
    },
    approach: {
      label: "Der MTC-Ansatz",
      headline: ["Strategie zuerst.", "Kreativität immer.", "Gemacht, um zu wirken."],
    },
    whyPoints: [
      {
        id: "think",
        title: "Denken",
        body: "Strategie, Research und Positionierung, geklärt vor der ersten Designentscheidung.",
      },
      {
        id: "make",
        title: "Machen",
        body: "Branding, Design, Content und digitale Erlebnisse, mit Absicht gestaltet.",
      },
      {
        id: "move",
        title: "Bewegen",
        body: "Launchen, verbreiten, bewerben und messen, dann weiter verbessern.",
      },
    ],
    howWeWork: {
      label: "Wie wir arbeiten",
      headline: "Ein klarer Prozess, vom ersten Gespräch bis zum Launch.",
      supporting: "Vier Phasen und ein Team, das Sie den ganzen Weg begleitet.",
    },
    process: [
      {
        id: "discover",
        number: "01",
        title: "Entdecken",
        body: "Wir lernen Ihr Unternehmen, Ihre Ziele und die Menschen kennen, die Sie erreichen möchten.",
      },
      {
        id: "define",
        number: "02",
        title: "Definieren",
        body: "Wir finden die Richtung, erstellen den Plan und bringen alle auf denselben Stand.",
      },
      {
        id: "create",
        number: "03",
        title: "Gestalten",
        body: "Von den Visuals über die Website bis zum Content: Wir fügen alle Teile zusammen.",
      },
      {
        id: "launch",
        number: "04",
        title: "Launchen",
        body: "Wir bringen es an den Start, sehen, was funktioniert, und machen es laufend besser.",
      },
    ],
    testimonialsIntro: {
      label: "Kundenstimmen",
      headline: "In den Worten unserer Kunden.",
    },
    finalCta: {
      headline: "Haben Sie ein Projekt im Kopf?",
      supporting: "Wählen Sie, was Sie brauchen. Den Rest übernehmen wir.",
      primaryCta: { label: "Projekt starten", href: "/contact" },
    },
    seo: {
      seoTitle: "MTC | Kreative Digitalagentur",
      metaDescription:
        "MTC ist eine kreative Digitalagentur für Branding, Websites, Social Media und Content. Ein Team, von der ersten Idee bis zum Launch.",
      noindex: false,
    },
  },
  studio: {
    intro: {
      label: "Studio",
      headline: ["Ein kreatives und", "digitales Studio."],
      supporting: "Wir bauen Marken, digitale Produkte und den Content, der sie trägt.",
    },
    about: {
      label: "Das Studio",
      body: [
        "MTC vereint Branding, Web, Social Media und Content unter einem Dach. Ein Team ist für das ganze Ergebnis verantwortlich, keine Kette getrennter Dienstleister.",
        "Strategie formt die Marke, die Marke formt die Website, und die Website gibt Ihrem Content einen Ort. Jede Disziplin macht die nächste stärker.",
      ],
    },
    capabilities: {
      label: "Kompetenzen",
      supporting: "Vier Disziplinen, die als eine arbeiten.",
    },
    principles: {
      label: "Prinzipien",
      items: [
        { id: "clarity", title: "Klarheit", body: "Weniger sagen, mehr meinen. Jede Entscheidung hat einen Grund." },
        {
          id: "strategy",
          title: "Strategie zuerst",
          body: "Wir klären die Positionierung vor der ersten Designentscheidung.",
        },
        {
          id: "creativity",
          title: "Kreativität immer",
          body: "Arbeit, die Aufmerksamkeit verdient, statt nur Platz zu füllen.",
        },
        {
          id: "execution",
          title: "Gemacht, um zu bestehen",
          body: "Entworfen und gebaut, um sich in der echten Welt zu bewähren.",
        },
      ],
    },
    seo: {
      seoTitle: "Studio | MTC",
      metaDescription:
        "MTC ist ein kreatives und digitales Studio: Branding, Web- und App-Entwicklung, Social Media und Content, als ein System gebaut.",
      noindex: false,
    },
  },
};
