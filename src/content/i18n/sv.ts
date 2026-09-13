import type { LocaleOverlay } from "./types";

/**
 * Swedish CMS content overlay. Deep-merged over the English CMS result at
 * render time (src/lib/cms/localized.ts) — never edited via /admin.
 * Brand name ("MTC"), project names (NOMA/FORM/NORTH/MOTIF), and person
 * names stay untranslated by omission (those fields aren't part of
 * LocaleOverlay at all).
 */
export const sv: LocaleOverlay = {
  services: {
    branding: {
      title: "Varumärke & visuell identitet",
      summary:
        "Positionering, namngivning, identitetssystem och riktlinjer som ger ett varumärke ett tydligt perspektiv och en enhetlig röst.",
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
        "Marknadsföringswebbplatser, webbappar och mobila produkter, designade och byggda på en modern, mätbar stack.",
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
        "Kontinuerlig närvaro i sociala och betalda medier, planerad och producerad utifrån en strategi med tydliga mål.",
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
        "Foto, film, motion och text — en innehållsmotor som kontinuerligt förser varumärke och kampanjer med material.",
      capabilities: ["Kreativa koncept", "Foto & film", "Motion & animation", "Copywriting", "Produktionsledning"],
      ctaLabel: "Utforska innehåll",
    },
  },
  projects: {
    noma: {
      client: "NOMA (fiktiv exempelkund)",
      category: "Varumärke & visuell identitet",
      description:
        "Ett självsäkert identitetssystem byggt för att förankra ett snabbt växande hospitality-varumärke — logotyp, palett och tonalitet gjorda för att resa.",
      services: ["Varumärkesstrategi", "Visuell identitet", "Riktlinjer"],
    },
    form: {
      client: "FORM (fiktiv exempelkund)",
      category: "Webb & digital upplevelse",
      description: "Ett modulärt produktwebbplatskoncept designat för snabbhet, tydlighet och konvertering.",
      services: ["UX- & UI-design", "Next.js-utveckling", "Designsystem"],
    },
    north: {
      client: "NORTH (fiktiv exempelkund)",
      category: "Social- & digitalkampanj",
      description: "Ett kampanjsystem byggt för att fungera över format, flöden och städer.",
      services: ["Kanalstrategi", "Betald social", "Kampanjkreativitet"],
    },
    motif: {
      client: "MOTIF (fiktiv exempelkund)",
      category: "Innehåll & reklam",
      description: "En innehållsmotor och ett annonssystem utformat för att hålla ett varumärke i ständig rörelse.",
      services: ["Kreativa koncept", "Motion & animation", "Produktion"],
    },
  },
  posts: {
    "brand-and-performance-one-plan": {
      title: "Varför varumärke och performance bör dela en plan",
      excerpt:
        "Att dela upp varumärkesbyggande och efterfrågegenerering i separata spår är så budget slösas bort. Så här planerar vi dem tillsammans.",
      body: [
        "De flesta team driver varumärke och performance som två budgetar, två byråer och två uppsättningar mätvärden. Performance-sidan optimerar för nästa klick; varumärkessidan optimerar för en känsla ingen mäter. Båda har rätt, och båda är ofullständiga.",
        "Vi planerar dem i en och samma kalender. En kampanj har ett varumärkesuppdrag och ett responsuppdrag, och samma idé bär båda — filmen som bygger minne klipps ner till annonsen som konverterar, landningssidan ärver kampanjens språk, retargetingen återanvänder huvudbudskapet.",
        "Testet är enkelt: om de två halvorna kunde bytas ut mot en konkurrents utan att någon märkte det, var de aldrig en plan.",
      ].join("\n\n"),
      category: "Strategi",
      tags: ["strategi", "marknadsföring"],
    },
    "design-system-is-a-brand-decision": {
      title: "Ett designsystem är ett varumärkesbeslut, inte en utvecklaruppgift",
      excerpt:
        "Komponenterna ni levererar kodar ert varumärke. Att behandla systemet som rent tekniskt är så identiteter driver isär.",
      body: [
        "En knapps rundning, ett korts skugga, den exakta grå tonen i ett inaktiverat tillstånd — det är varumärkesbeslut som råkar vara skrivna i kod. När systemet ägs enbart av utveckling fattas de besluten av den som råkar sitta med ärendet.",
        "Vi bygger systemet som ett gemensamt artefakt. Design äger tokens och avsikten; utveckling äger implementationen och garantierna. Ingen levererar ett nytt mönster ensam.",
        "Vinsten är medvetet oglamorös: varje skärm ser ut som att den kommer från samma plats, för det gör den.",
      ].join("\n\n"),
      category: "Design",
      tags: ["designsystem", "varumärke"],
    },
    "motion-should-explain": {
      title: "Rörelse ska förklara, inte dekorera",
      excerpt: "Den bästa gränssnittsanimationen är den du inte lägger märke till — den gjorde bara förändringen begriplig.",
      body: [
        "Animation förtjänar sin plats när den besvarar en fråga användaren just höll på att ställa: var kom det ifrån, vart tog det vägen, vad laddas, vad ändrade jag just.",
        "Allt annat är en kostnad. Rörelse fördröjer interaktionen, konkurrerar om uppmärksamheten och åldras dåligt. Vår standard är ingen animation; vi lägger tillbaka den en övergång i taget, och bara när den statiska versionen verkligen är svårare att läsa.",
        "Snabbt, kort och täckt av reducerad rörelse. Om den behöver en specifikation längre än en mening är den förmodligen dekoration.",
      ].join("\n\n"),
      category: "Design",
      tags: ["motion", "design"],
    },
    "what-editorial-means": {
      title: "Vad vi menar med „editorial“",
      excerpt: "Det är inte ett antikva-typsnitt och mycket vitrymd. Det är hierarki som gör det jobb dekoration annars gör.",
      body: [
        "Editorial design lutar sig mot typografi, skala, mellanrum och ett rutnät för att skapa ordning — därför behövs sällan ramar, kort, skuggor eller färg för att visa vad som spelar roll.",
        "Den återhållsamheten är poängen. En sida med färre grepp har färre saker som kan bli fel, och den åldras i takt med texten snarare än i takt med en trend.",
        "När vi kallar en layout editorial menar vi att man skulle kunna ta bort varje linje och box och ändå veta exakt var man ska titta.",
      ].join("\n\n"),
      category: "Design",
      tags: ["design", "hantverk"],
    },
    "naming-and-positioning": {
      title: "Namngivning är det billigaste sättet att få positioneringen fel",
      excerpt: "Ett namn kan inte rädda en svag position, men det kan tyst underminera en stark i flera år.",
      body: [
        "Namngivning brukar komma sent, under tidspress, bedömt efter smak i ett rum. Då är strategiarbetet redan gjort och halvt bortglömt, så namnet väljs efter hur det låter snarare än vad det behöver bära.",
        "Vi behandlar namnet som det kortast möjliga uttrycket för positioneringen. Om strategin säger “tydlighet” ska namnet inte behöva ett stycke för att förklara sig själv.",
        "Testet är om namnet fortfarande är begripligt om tre år, i en mening, uttalat högt.",
      ].join("\n\n"),
      category: "Strategi",
      tags: ["varumärke", "strategi"],
    },
    "ship-the-boring-version-first": {
      title: "Lansera den tråkiga versionen först",
      excerpt: "Den ambitiösa versionen är lättare att bedöma när den enkla redan är live och används.",
      body: [
        "Varje projekt har en version som är uppenbar, liten och lite besviken. Den försöker vi lansera först.",
        "Levande mjukvara lär snabbare än en prototyp. Så snart den enkla versionen möter verklig användning blir diskussionerna om den ambitiösa versionen konkreta — man ser vilka delar som var värda risken och vilka som bara var tycke.",
        "Det är ingen sänkning av kraven. Det är en ordning för dem.",
      ].join("\n\n"),
      category: "Process",
      tags: ["process", "produkt"],
    },
  },
  testimonials: {
    "t-north": {
      quote:
        "MTC byggde om vårt varumärke och vår webbplats som ett och samma projekt. Positioneringen matchar äntligen det vi faktiskt gör, och siffrorna följde inom ett kvartal.",
      role: "Marknadschef",
      company: "Platshållarföretag",
    },
    "t-arc": {
      quote:
        "De behandlade vår lansering som ett system: identitet, produkt och kampanj levererades tillsammans istället för i tre separata faser.",
      role: "Grundare",
      company: "Platshållarstudio",
    },
    "t-field": {
      quote: "Tydlig strategi, vass kreativitet och ett team som hela vägen stod till svars för resultaten.",
      role: "Varumärkesdirektör",
      company: "Platshållargrupp",
    },
  },
  team: {
    "tm-1": {
      role: "Grundare / Kreativdirektör",
      bio: "Leder varumärkes- och kreativ inriktning i alla uppdrag.",
    },
    "tm-2": {
      role: "Strategiansvarig",
      bio: "Ansvarar för positionering, research och mätning.",
    },
    "tm-3": {
      role: "Teknikchef",
      bio: "Ansvarar för produktdesign och teknisk leverans.",
    },
  },
  homepage: {
    hero: {
      label: "Kreativ digitalbyrå",
      headline: ["Vi bygger varumärken.", "Vi skapar digitalt.", "Vi får idéer att röra sig."],
      supporting:
        "MTC förenar strategi, kreativ ledning, teknik och marknadsföring för att skapa varumärken och digitala upplevelser som syns.",
      primaryCta: { label: "Starta ett projekt", href: "/contact" },
      secondaryCta: { label: "Se våra arbeten", href: "/work" },
    },
    intro: {
      label: "Vad vi gör",
      statement: "Vi bygger varumärken, digitala upplevelser och kampanjer som gör företag omöjliga att ignorera.",
      body:
        "MTC förenar varumärkesbyggande, digitala upplevelser, sociala medier, marknadsföring, innehåll och reklam under ett tak — som ett enda system istället för sex separata leverantörer.",
    },
    services: {
      label: "Våra tjänster",
      headline: "Allt ditt varumärke behöver för att ta nästa steg.",
      supporting: "Fyra discipliner. Ett ansvarigt team.",
    },
    approach: {
      label: "MTC:s arbetssätt",
      headline: ["Strategi först.", "Kreativitet alltid.", "Byggt för att prestera."],
    },
    whyPoints: [
      {
        id: "think",
        title: "Tänk",
        body: "Strategi, research och positionering — klart innan ett enda genomförandebeslut fattas.",
      },
      {
        id: "make",
        title: "Skapa",
        body: "Varumärke, design, innehåll och digitala upplevelser, byggda med avsikt.",
      },
      {
        id: "move",
        title: "Agera",
        body: "Lansera, distribuera, annonsera, mät — och fortsätt förbättra.",
      },
    ],
    howWeWork: {
      label: "Hur vi arbetar",
      headline: "Från första idé till verklig effekt.",
      supporting: "Fyra steg. Ett sammanhängande system.",
    },
    process: [
      { id: "discover", number: "01", title: "Upptäck", body: "Förstå verksamheten, målgruppen, målen och möjligheten." },
      {
        id: "define",
        number: "02",
        title: "Definiera",
        body: "Bygg strategin, positioneringen, den kreativa riktningen och planen.",
      },
      {
        id: "create",
        number: "03",
        title: "Skapa",
        body: "Designa, utveckla och producera varumärket, den digitala upplevelsen och innehållet.",
      },
      {
        id: "launch",
        number: "04",
        title: "Lansera",
        body: "Lansera arbetet, distribuera det, marknadsför det och lär av resultaten.",
      },
    ],
    stats: [
      {
        id: "campaigns",
        value: "+120",
        label: "Lanserade kampanjer",
        note: "Platshållare — ersätt med en verifierad siffra före publicering.",
      },
      {
        id: "projects",
        value: "+80",
        label: "Varumärkes- & digitalprojekt",
        note: "Platshållare — ersätt med en verifierad siffra före publicering.",
      },
      {
        id: "impressions",
        value: "+45M",
        label: "Genererade visningar",
        note: "Platshållare — ersätt med en verifierad siffra före publicering.",
      },
      {
        id: "roas",
        value: "3,8x",
        label: "Genomsnittlig kampanj-ROAS",
        note: "Platshållare — ersätt med en verifierad siffra före publicering.",
      },
    ],
    testimonialsIntro: {
      label: "Vad kunder säger",
      headline: "Bra arbete blir ihågkommet.",
      supporting: "Några ord från människor vi har samarbetat med.",
    },
    finalCta: {
      headline: "Har du ett projekt i åtanke?",
      supporting: "Låt oss skapa något värt att lägga märke till.",
      primaryCta: { label: "Starta ett projekt", href: "/contact" },
    },
    seo: {
      seoTitle: "MTC — Kreativ digitalbyrå",
      metaDescription:
        "Varumärke, webb- & apputveckling, sociala medier och innehåll — strategi först, kreativitet alltid, teknik där den gör skillnad.",
      noindex: false,
    },
  },
  studio: {
    intro: {
      label: "Studio",
      headline: ["Vi är en", "kreativ och", "digital studio."],
      supporting: "Vi bygger varumärken, digitala produkter och innehållet som bär dem.",
    },
    about: {
      label: "Studion",
      body: [
        "MTC förenar varumärkesbyggande, digitalt och innehåll under ett tak — ett team med ansvar för helheten, inte en kedja av separata leverantörer.",
        "Strategin formar varumärket, varumärket formar produkten, och produkten ger innehållet en plats att leva på. Varje disciplin skärper nästa.",
      ],
    },
    capabilities: {
      label: "Kompetenser",
      supporting: "Fyra discipliner som fungerar som en.",
    },
    principles: {
      label: "Principer",
      items: [
        { id: "clarity", title: "Tydlighet", body: "Säg mindre, mena mer — varje val har en anledning." },
        {
          id: "strategy",
          title: "Strategi först",
          body: "Positioneringen är klar innan det första genomförandebeslutet.",
        },
        {
          id: "creativity",
          title: "Kreativitet alltid",
          body: "Arbete som förtjänar uppmärksamhet istället för att bara fylla utrymme.",
        },
        {
          id: "execution",
          title: "Byggt för att levereras",
          body: "Designat och gjort för att hålla i verkligheten.",
        },
      ],
    },
    seo: {
      seoTitle: "Studio — MTC",
      metaDescription:
        "MTC är en kreativ och digital studio — varumärke, webb- & apputveckling, sociala medier och innehåll, byggt som ett system.",
      noindex: false,
    },
  },
};
