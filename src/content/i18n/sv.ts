import type { LocaleOverlay } from "./types";

/**
 * Swedish CMS content overlay. Deep-merged over the English CMS result at
 * render time (src/lib/cms/localized.ts) — never edited via /admin.
 * Brand, project and person names stay untranslated by omission (those
 * fields aren't part of LocaleOverlay at all). Arrays merge over the English
 * array's length, so headline lines and paragraphs must match its count.
 * Journal posts are published in English only.
 */
export const sv: LocaleOverlay = {
  services: {
    branding: {
      title: "Varumärke & visuell identitet",
      summary:
        "Vi tar reda på vad som gör dig annorlunda och ger det ett utseende, en röst och ett system som håller ihop överallt där det syns.",
      capabilities: [
        "Varumärkesstrategi & positionering",
        "Namngivning & budskap",
        "Logotyp & identitetssystem",
        "Art direction & riktlinjer",
        "Designsystem för varumärket",
      ],
      ctaLabel: "Utforska varumärke",
    },
    "web-app": {
      title: "Webb- & apputveckling",
      summary:
        "Webbplatser och webbappar som designas och byggs internt på en modern stack: snabba, tydliga och enkla för ditt team att hålla uppdaterade.",
      capabilities: [
        "UX- & UI-design",
        "Next.js-/React-utveckling",
        "Headless CMS-integration",
        "Designsystem & komponenter",
        "Prestanda & Core Web Vitals",
      ],
      ctaLabel: "Utforska utveckling",
    },
    "social-marketing": {
      title: "Sociala medier & digital marknadsföring",
      summary:
        "Sociala och betalda kampanjer som planeras utifrån tydliga mål, så att varje inlägg och varje annons har en uppgift och en siffra att svara mot.",
      capabilities: [
        "Kanal- & innehållsstrategi",
        "Betald social & sök",
        "Community management",
        "Analys & rapportering",
        "Kampanjoptimering",
      ],
      ctaLabel: "Utforska marknadsföring",
    },
    "content-advertising": {
      title: "Innehållsproduktion & reklam",
      summary:
        "Foto, film, motion och text som håller ditt varumärke och dina kampanjer försedda med material som får folk att stanna upp.",
      capabilities: ["Kreativa koncept", "Foto & film", "Motion & animation", "Copywriting", "Produktionsledning"],
      ctaLabel: "Utforska innehåll",
    },
  },
  projects: {
    balkanbee: {
      category: "Varumärke & visuell identitet",
      description:
        "BalkanBee är en marknadsplats för begagnat som förbinder köpare och säljare över hela Balkan: en plattform, många länder, inga gränser. Vi gav den en identitet som matchar, med ett bikakemärke byggt kring ett paket, en varm palett från rött till bärnsten och en röst som sammanfattas i tre ord: ”built for trade.”",
      services: ["Varumärkesstrategi", "Logotyp & visuell identitet", "Sociala medier"],
    },
    "as-med-healthcare-management-system": {
      category: "Webbapp",
      description:
        "Ett skräddarsytt system för vårdadministration åt AS-MED som samlar patientjournaler, klinisk dokumentation, ICD-10-kodning, analys och säker granskningsloggning i en plattform.",
      services: ["Webbapp"],
    },
    "leo-gmbh": {
      category: "Webbutveckling & underhåll",
      description:
        "En modern webbplats för ett bygg- och renoveringsföretag i Wien, byggd för att tydligt presentera Leo GmbH:s tjänster, projekt och expertis.",
      services: ["Webbdesign", "Webbutveckling", "Responsiv design"],
    },
    "pixel-print": {
      category: "Varumärke & visuell identitet",
      description:
        "En komplett visuell identitet för Pixel Print, byggd kring en distinkt logotyp, ett flexibelt färgsystem och en enhetlig uppsättning varumärkestillämpningar.",
      services: ["Varumärkesstrategi", "Logotypdesign", "Visuell identitet", "Varumärkestillämpningar", "Tryckdesign"],
    },
    "summit-balkans": {
      category: "Varumärke & visuell identitet",
      description:
        "En komplett varumärkesidentitet för Summit Balkans, ett varumärke byggt kring äventyr, upptäckt och Balkans natur. Vi utvecklade det från grunden: visuell identitet, logotypsystem, typografi, färgpalett och kreativ riktning, enhetligt i både digitala och fysiska kontaktpunkter.",
      services: ["Visuell identitet", "Logotypsystem", "Typografi", "Färgpalett", "Kreativ riktning"],
    },
    "d12-construction-engineering-brand-identity": {
      category: "Varumärke & visuell identitet",
      description:
        "Varumärkesidentitet och visuell riktning för D12 Construction & Engineering: en modern, strukturerad och distinkt identitet som speglar företagets fokus på bygg och ingenjörskonst.",
      services: ["Varumärkesidentitet", "Visuell riktning"],
    },
  },
  homepage: {
    hero: {
      label: "Kreativ digitalbyrå",
      headline: ["Vi gör varumärken", "omöjliga att ignorera."],
      supporting:
        "Varumärke, webbplatser, sociala medier och innehåll från ett kreativt team, från första idé till lanseringsdagen.",
      primaryCta: { label: "Starta ett projekt", href: "/contact" },
      secondaryCta: { label: "Se våra arbeten", href: "/work" },
    },
    intro: {
      label: "Varför ett team",
      statement: "Ett team för hela uppdraget: varumärket, webbplatsen, innehållet och kampanjerna som bär det.",
      body: "Färre överlämningar, en standard och arbete som hänger ihop eftersom samma människor har gjort det.",
    },
    services: {
      label: "Vad vi gör",
      headline: "Ett team. Fyra discipliner.",
      supporting:
        "De flesta projekt behöver mer än en, så att ditt varumärke, din webbplats och dina kampanjer ser ut och låter som att de hör ihop.",
    },
    approach: {
      label: "MTC:s arbetssätt",
      headline: ["Strategi först.", "Kreativitet alltid.", "Byggt för att prestera."],
    },
    whyPoints: [
      {
        id: "think",
        title: "Tänk",
        body: "Strategi, research och positionering, klart före det första designbeslutet.",
      },
      {
        id: "make",
        title: "Skapa",
        body: "Varumärke, design, innehåll och digitala upplevelser, byggda med avsikt.",
      },
      {
        id: "move",
        title: "Agera",
        body: "Lansera, sprid, annonsera och mät, och fortsätt sedan förbättra.",
      },
    ],
    howWeWork: {
      label: "Hur vi arbetar",
      headline: "En tydlig process, från första samtalet till lansering.",
      supporting: "Fyra steg, och ett team med dig hela vägen.",
    },
    process: [
      {
        id: "discover",
        number: "01",
        title: "Upptäck",
        body: "Vi lär känna din verksamhet, din målgrupp och hur framgång ska se ut.",
      },
      {
        id: "define",
        number: "02",
        title: "Definiera",
        body: "Vi sätter strategin, positioneringen och den kreativa riktningen, och kommer överens om en plan.",
      },
      {
        id: "create",
        number: "03",
        title: "Skapa",
        body: "Vi designar, bygger och producerar varumärket, webbplatsen och innehållet.",
      },
      {
        id: "launch",
        number: "04",
        title: "Lansera",
        body: "Vi lanserar, marknadsför och mäter arbetet, och fortsätter förbättra det som fungerar.",
      },
    ],
    testimonialsIntro: {
      label: "Kundröster",
      headline: "Med våra kunders ord.",
    },
    finalCta: {
      headline: "Har du ett projekt i åtanke?",
      supporting: "Välj vad du behöver, så tar vi det därifrån.",
      primaryCta: { label: "Starta ett projekt", href: "/contact" },
    },
    seo: {
      seoTitle: "MTC | Kreativ digitalbyrå",
      metaDescription:
        "MTC är en kreativ digitalbyrå för varumärke, webbplatser, sociala medier och innehåll. Ett team, från första idé till lanseringsdagen.",
      noindex: false,
    },
  },
  studio: {
    intro: {
      label: "Studio",
      headline: ["En kreativ och", "digital studio."],
      supporting: "Vi bygger varumärken, digitala produkter och innehållet som bär dem.",
    },
    about: {
      label: "Studion",
      body: [
        "MTC samlar varumärke, webb, sociala medier och innehåll under ett tak. Ett team ansvarar för hela resultatet, inte en kedja av separata leverantörer.",
        "Strategin formar varumärket, varumärket formar webbplatsen och webbplatsen ger ditt innehåll en plats att leva. Varje disciplin gör nästa starkare.",
      ],
    },
    capabilities: {
      label: "Kompetenser",
      supporting: "Fyra discipliner som arbetar som en.",
    },
    principles: {
      label: "Principer",
      items: [
        { id: "clarity", title: "Tydlighet", body: "Säg mindre, mena mer. Varje val har ett skäl." },
        {
          id: "strategy",
          title: "Strategi först",
          body: "Vi landar positioneringen före det första designbeslutet.",
        },
        {
          id: "creativity",
          title: "Kreativitet alltid",
          body: "Arbete som förtjänar uppmärksamhet i stället för att bara fylla ut.",
        },
        {
          id: "execution",
          title: "Byggt för att leverera",
          body: "Designat och byggt för att hålla i verkligheten.",
        },
      ],
    },
    seo: {
      seoTitle: "Studio | MTC",
      metaDescription:
        "MTC är en kreativ och digital studio: varumärke, webb- och apputveckling, sociala medier och innehåll, byggt som ett system.",
      noindex: false,
    },
  },
};
