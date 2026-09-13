import type { LocaleOverlay } from "./types";

/**
 * German CMS content overlay. Deep-merged over the English CMS result at
 * render time (src/lib/cms/localized.ts) — never edited via /admin.
 * Brand name ("MTC"), project names (NOMA/FORM/NORTH/MOTIF), and person
 * names stay untranslated by omission (those fields aren't part of
 * LocaleOverlay at all).
 */
export const de: LocaleOverlay = {
  services: {
    branding: {
      title: "Branding & visuelle Identität",
      summary:
        "Positionierung, Naming, Identitätssysteme und Guidelines, die einer Marke eine klare Haltung und eine konsistente Stimme geben.",
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
        "Marketing-Websites, Webanwendungen und mobile Produkte, konzipiert und entwickelt auf einem modernen, messbaren Stack.",
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
      title: "Social Media & Digitales Marketing",
      summary:
        "Durchgängige Social- und Paid-Media-Präsenz, geplant und umgesetzt nach einer Strategie mit klaren Zielen.",
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
      title: "Content-Erstellung & Werbung",
      summary:
        "Fotografie, Film, Motion Design und Text — eine Content-Engine, die Marke und Kampagnen kontinuierlich versorgt.",
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
    noma: {
      client: "NOMA (fiktiver Platzhalterkunde)",
      category: "Branding & visuelle Identität",
      description:
        "Ein selbstbewusstes Identitätssystem, das eine schnell wachsende Hospitality-Marke verankert — Wortmarke, Farbpalette und Tonalität, gemacht, um zu reisen.",
      services: ["Markenstrategie", "Visuelle Identität", "Guidelines"],
    },
    form: {
      client: "FORM (fiktiver Platzhalterkunde)",
      category: "Web & digitale Erlebnisse",
      description:
        "Ein modulares Produktwebsite-Konzept, entwickelt für Geschwindigkeit, Klarheit und Conversion.",
      services: ["UX- & UI-Design", "Next.js-Entwicklung", "Designsystem"],
    },
    north: {
      client: "NORTH (fiktiver Platzhalterkunde)",
      category: "Social- & Digitalkampagne",
      description: "Ein Kampagnensystem, gebaut, um über Formate, Feeds und Städte hinweg zu funktionieren.",
      services: ["Kanalstrategie", "Paid Social", "Kampagnenkreation"],
    },
    motif: {
      client: "MOTIF (fiktiver Platzhalterkunde)",
      category: "Content & Werbung",
      description:
        "Eine Content-Engine und ein Anzeigensystem, entwickelt, um eine Marke kontinuierlich in Bewegung zu halten.",
      services: ["Kreativkonzepte", "Motion & Animation", "Produktion"],
    },
  },
  posts: {
    "brand-and-performance-one-plan": {
      title: "Warum Marke und Performance einen gemeinsamen Plan brauchen",
      excerpt:
        "Markenaufbau und Performance-Marketing in getrennte Workstreams zu splitten ist der sicherste Weg, Budget zu verschwenden. So planen wir beides zusammen.",
      body: [
        "Die meisten Teams führen Marke und Performance als zwei Budgets, zwei Agenturen und zwei Kennzahlensets. Die Performance-Seite optimiert auf den nächsten Klick; die Markenseite optimiert auf ein Gefühl, das niemand misst. Beide haben recht, und beide sind unvollständig.",
        "Wir planen beides auf einem Kalender. Eine Kampagne hat einen Markenauftrag und einen Response-Auftrag, und dieselbe Idee trägt beide — der Film, der Erinnerung aufbaut, wird zum Spot geschnitten, der konvertiert, die Landingpage übernimmt die Sprache der Kampagne, das Retargeting nutzt dieselbe Kernzeile.",
        "Der Test ist einfach: Ließen sich die beiden Hälften unbemerkt gegen die eines Wettbewerbers austauschen, waren sie nie ein Plan.",
      ].join("\n\n"),
      category: "Strategie",
      tags: ["strategie", "marketing"],
    },
    "design-system-is-a-brand-decision": {
      title: "Ein Designsystem ist eine Markenentscheidung, keine Entwickleraufgabe",
      excerpt:
        "Die Komponenten, die Sie ausliefern, kodieren Ihre Marke. Wer das System rein technisch behandelt, lässt die Identität driften.",
      body: [
        "Der Radius eines Buttons, der Schatten einer Karte, das exakte Grau eines deaktivierten Zustands — das sind Markenentscheidungen, die zufällig in Code geschrieben sind. Gehört das System allein dem Engineering, trifft diese Entscheidungen, wer gerade am Ticket sitzt.",
        "Wir bauen das System als gemeinsames Artefakt. Design verantwortet die Tokens und die Absicht, Engineering die Umsetzung und die Garantien. Kein neues Pattern entsteht allein.",
        "Der Gewinn ist absichtlich unspektakulär: Jeder Screen sieht aus, als käme er aus derselben Quelle — weil er es tut.",
      ].join("\n\n"),
      category: "Design",
      tags: ["designsysteme", "branding"],
    },
    "motion-should-explain": {
      title: "Bewegung sollte erklären, nicht dekorieren",
      excerpt:
        "Die beste Interface-Animation ist die, die man nicht bemerkt — sie hat die Veränderung einfach nur verständlich gemacht.",
      body: [
        "Animation verdient ihren Platz, wenn sie eine Frage beantwortet, die der Nutzer sich gerade stellt: Wo kam das her, wo ist es hin, was lädt gerade, was habe ich gerade verändert.",
        "Alles andere kostet. Bewegung verzögert die Interaktion, konkurriert um Aufmerksamkeit und altert schlecht. Unser Standard ist keine Animation; wir fügen sie einzeln wieder hinzu, und nur, wenn die statische Version wirklich schwerer zu lesen ist.",
        "Schnell, kurz und durch reduzierte Bewegung abgedeckt. Braucht sie eine Spezifikation, die länger als ein Satz ist, ist sie wahrscheinlich Dekoration.",
      ].join("\n\n"),
      category: "Design",
      tags: ["motion", "design"],
    },
    "what-editorial-means": {
      title: "Was wir meinen, wenn wir „editorial“ sagen",
      excerpt:
        "Es ist keine Serifenschrift und viel Weißraum. Es ist Hierarchie, die die Arbeit übernimmt, die sonst Dekoration erledigt.",
      body: [
        "Editorial Design stützt sich auf Typografie, Skalierung, Abstand und ein Raster, um Ordnung zu schaffen — deshalb braucht es selten Rahmen, Karten, Schatten oder Farbe, um zu zeigen, was zählt.",
        "Diese Zurückhaltung ist der Punkt. Eine Seite mit weniger Stilmitteln hat weniger, das schiefgehen kann, und sie altert im Tempo des Textes statt im Tempo eines Trends.",
        "Wenn wir ein Layout editorial nennen, meinen wir: Man könnte jede Linie und jede Box entfernen und wüsste trotzdem genau, wohin man schauen soll.",
      ].join("\n\n"),
      category: "Design",
      tags: ["design", "handwerk"],
    },
    "naming-and-positioning": {
      title: "Naming ist der billigste Weg, die Positionierung falsch zu machen",
      excerpt:
        "Ein Name kann eine schwache Position nicht retten, aber er kann eine starke jahrelang leise untergraben.",
      body: [
        "Naming kommt meist spät, unter Zeitdruck, beurteilt nach Geschmack in einem Raum. Bis dahin ist die Strategiearbeit erledigt und halb vergessen, also wird der Name danach ausgewählt, wie er klingt, statt danach, was er tragen muss.",
        "Wir behandeln den Namen als kürzestmöglichen Ausdruck der Positionierung. Wenn die Strategie „Klarheit“ sagt, sollte der Name keinen Absatz brauchen, um sich zu erklären.",
        "Der Test ist, ob der Name in drei Jahren noch Sinn ergibt, in einem Satz, laut ausgesprochen.",
      ].join("\n\n"),
      category: "Strategie",
      tags: ["branding", "strategie"],
    },
    "ship-the-boring-version-first": {
      title: "Erst die unspektakuläre Version ausliefern",
      excerpt: "Die ambitionierte Version lässt sich leichter beurteilen, wenn die einfache bereits live ist und genutzt wird.",
      body: [
        "Jedes Projekt hat eine Version, die naheliegend, klein und leicht enttäuschend ist. Die versuchen wir zuerst auszuliefern.",
        "Live-Software lehrt schneller als ein Prototyp. Sobald die einfache Version im echten Einsatz ist, werden die Diskussionen über die ambitionierte Version konkret — man sieht, welche Teile das Risiko wert waren und welche reine Geschmackssache.",
        "Das ist keine Absenkung der Ansprüche. Es ist ihre Reihenfolge.",
      ].join("\n\n"),
      category: "Prozess",
      tags: ["prozess", "produkt"],
    },
  },
  testimonials: {
    "t-north": {
      quote:
        "MTC hat unsere Marke und unsere Website als ein Projekt neu aufgebaut. Die Positionierung entspricht endlich dem, was wir wirklich tun, und die Zahlen folgten innerhalb eines Quartals.",
      role: "Marketingleitung",
      company: "Platzhalter-Unternehmen",
    },
    "t-arc": {
      quote:
        "Sie haben unseren Launch als System behandelt: Identität, Produkt und Kampagne wurden gemeinsam ausgeliefert statt in drei getrennten Phasen.",
      role: "Gründer",
      company: "Platzhalter-Studio",
    },
    "t-field": {
      quote:
        "Klare Strategie, scharfe Kreation und ein Team, das während des gesamten Prozesses für die Ergebnisse verantwortlich blieb.",
      role: "Markendirektor",
      company: "Platzhalter-Gruppe",
    },
  },
  team: {
    "tm-1": {
      role: "Gründer / Kreativdirektor",
      bio: "Verantwortet Marken- und Kreativführung über alle Projekte hinweg.",
    },
    "tm-2": {
      role: "Strategieleitung",
      bio: "Verantwortet Positionierung, Research und Erfolgsmessung.",
    },
    "tm-3": {
      role: "Leitung Technologie",
      bio: "Verantwortet Produktdesign und die technische Umsetzung.",
    },
  },
  homepage: {
    hero: {
      label: "Kreative Digitalagentur",
      headline: ["Wir bauen Marken.", "Wir gestalten Digitales.", "Wir bringen Ideen in Bewegung."],
      supporting:
        "MTC verbindet Strategie, Kreativdirektion, Technologie und Marketing, um Marken und digitale Erlebnisse zu schaffen, die auffallen.",
      primaryCta: { label: "Projekt starten", href: "/contact" },
      secondaryCta: { label: "Unsere Arbeiten ansehen", href: "/work" },
    },
    intro: {
      label: "Was wir tun",
      statement: "Wir bauen Marken, digitale Erlebnisse und Kampagnen, die Unternehmen unmöglich zu übersehen machen.",
      body: "MTC vereint Branding, digitale Erlebnisse, Social Media, Marketing, Content und Werbung unter einem Dach — als ein System statt sechs getrennter Dienstleister.",
    },
    services: {
      label: "Unsere Leistungen",
      headline: "Alles, was Ihre Marke braucht, um voranzukommen.",
      supporting: "Vier Disziplinen. Ein verantwortliches Team.",
    },
    approach: {
      label: "Der MTC-Ansatz",
      headline: ["Strategie zuerst.", "Kreativität immer.", "Gemacht, um zu performen."],
    },
    whyPoints: [
      {
        id: "think",
        title: "Denken",
        body: "Strategie, Research und Positionierung — geklärt, bevor auch nur eine Umsetzungsentscheidung fällt.",
      },
      {
        id: "make",
        title: "Machen",
        body: "Branding, Design, Content und digitale Erlebnisse, mit Absicht gestaltet.",
      },
      {
        id: "move",
        title: "Bewegen",
        body: "Launchen, verteilen, bewerben, messen — und stetig verbessern.",
      },
    ],
    howWeWork: {
      label: "Wie wir arbeiten",
      headline: "Von der ersten Idee zur Wirkung in der realen Welt.",
      supporting: "Vier Phasen. Ein durchgängiges System.",
    },
    process: [
      { id: "discover", number: "01", title: "Entdecken", body: "Geschäft, Zielgruppe, Ziele und Potenzial verstehen." },
      {
        id: "define",
        number: "02",
        title: "Definieren",
        body: "Strategie, Positionierung, Kreativrichtung und Plan entwickeln.",
      },
      {
        id: "create",
        number: "03",
        title: "Erstellen",
        body: "Marke, digitales Erlebnis und Content gestalten, entwickeln und produzieren.",
      },
      {
        id: "launch",
        number: "04",
        title: "Starten",
        body: "Die Arbeit veröffentlichen, verteilen, bewerben und aus den Ergebnissen lernen.",
      },
    ],
    stats: [
      {
        id: "campaigns",
        value: "+120",
        label: "Gestartete Kampagnen",
        note: "Platzhalter — vor Veröffentlichung durch eine geprüfte Zahl ersetzen.",
      },
      {
        id: "projects",
        value: "+80",
        label: "Marken- & Digitalprojekte",
        note: "Platzhalter — vor Veröffentlichung durch eine geprüfte Zahl ersetzen.",
      },
      {
        id: "impressions",
        value: "+45M",
        label: "Erzielte Impressions",
        note: "Platzhalter — vor Veröffentlichung durch eine geprüfte Zahl ersetzen.",
      },
      {
        id: "roas",
        value: "3,8x",
        label: "Durchschnittlicher Kampagnen-ROAS",
        note: "Platzhalter — vor Veröffentlichung durch eine geprüfte Zahl ersetzen.",
      },
    ],
    testimonialsIntro: {
      label: "Was Kunden sagen",
      headline: "Gute Arbeit bleibt in Erinnerung.",
      supporting: "Ein paar Worte von Menschen, mit denen wir zusammengearbeitet haben.",
    },
    finalCta: {
      headline: "Haben Sie ein Projekt im Kopf?",
      supporting: "Lassen Sie uns etwas erschaffen, das auffällt.",
      primaryCta: { label: "Projekt starten", href: "/contact" },
    },
    seo: {
      seoTitle: "MTC — Kreative Digitalagentur",
      metaDescription:
        "Branding, Web- & App-Entwicklung, Social Media und Content — Strategie zuerst, Kreativität immer, Technologie dort, wo sie zählt.",
      noindex: false,
    },
  },
  studio: {
    intro: {
      label: "Studio",
      headline: ["Wir sind ein", "kreatives und", "digitales Studio."],
      supporting: "Wir bauen Marken, digitale Produkte und den Content, der sie trägt.",
    },
    about: {
      label: "Das Studio",
      body: [
        "MTC vereint Branding, Digitales und Content unter einem Dach — ein Team, das für das Ganze verantwortlich ist, keine Kette getrennter Dienstleister.",
        "Strategie formt die Marke, die Marke formt das Produkt, und das Produkt gibt dem Content einen Ort zum Leben. Jede Disziplin schärft die nächste.",
      ],
    },
    capabilities: {
      label: "Kompetenzen",
      supporting: "Vier Disziplinen, die als eine arbeiten.",
    },
    principles: {
      label: "Prinzipien",
      items: [
        { id: "clarity", title: "Klarheit", body: "Weniger sagen, mehr meinen — jede Entscheidung hat einen Grund." },
        {
          id: "strategy",
          title: "Strategie zuerst",
          body: "Die Positionierung steht fest, bevor die erste Umsetzungsentscheidung fällt.",
        },
        {
          id: "creativity",
          title: "Kreativität immer",
          body: "Arbeit, die Aufmerksamkeit verdient, statt nur Platz zu füllen.",
        },
        {
          id: "execution",
          title: "Gemacht, um zu liefern",
          body: "Entworfen und gemacht, um sich in der realen Welt zu bewähren.",
        },
      ],
    },
    seo: {
      seoTitle: "Studio — MTC",
      metaDescription:
        "MTC ist ein kreatives und digitales Studio — Branding, Web- & App-Entwicklung, Social Media und Content, als ein System aufgebaut.",
      noindex: false,
    },
  },
};
