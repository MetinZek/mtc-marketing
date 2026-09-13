import type { z } from "zod";
import type { postSchema } from "../schema";

/** Seed only — see src/content/seed.ts. Typed at the schema's input level. */
type Post = z.input<typeof postSchema>;

/**
 * Placeholder journal entries. Copy is fictional, written for MTC;
 * cover images are hand-built abstract compositions under
 * /public/journal (shape + one accent, no stock photography). `body`
 * is plain paragraphs separated by a blank line — the article page
 * splits on that and renders each as a <p>. Replace with real writing
 * through the CMS; the shape (Post, from src/content/schema.ts) stays.
 */
export const posts: Post[] = [
  {
    id: "post-1",
    title: "Why brand and performance should share a plan",
    slug: "brand-and-performance-one-plan",
    excerpt:
      "Splitting brand-building and demand-generation into separate workstreams is how budgets get wasted. Here is how we plan them together.",
    body: [
      "Most teams run brand and performance as two budgets, two agencies and two sets of metrics. The performance side optimises for the next click; the brand side optimises for a feeling nobody measures. Both are right, and both are incomplete.",
      "We plan them on one calendar. A campaign has a brand job and a response job, and the same idea carries both — the film that builds memory is cut down into the ad that converts, the landing page inherits the campaign's language, the retargeting reuses the hero line.",
      "The test is simple: if the two halves could be swapped for a competitor's without anyone noticing, they were never one plan.",
    ].join("\n\n"),
    coverImage: {
      src: "/journal/entry-1.svg",
      alt: "Abstract journal cover — a grid of outlined rectangles with one blue and one black block.",
      width: 1200,
      height: 800,
    },
    author: "MTC",
    publishedAt: "2026-03-18",
    tags: ["strategy", "marketing"],
    status: "published",
    noindex: false,
  },
  {
    id: "post-2",
    title: "A design system is a brand decision, not a dev task",
    slug: "design-system-is-a-brand-decision",
    excerpt:
      "The components you ship encode your brand. Treating the system as purely technical is how identities drift.",
    body: [
      "A button's radius, a card's shadow, the exact grey of a disabled state — these are brand decisions that happen to be written in code. When the system is owned only by engineering, those decisions get made by whoever is closest to the ticket.",
      "We build the system as a shared artefact. Design owns the tokens and the intent; engineering owns the implementation and the guarantees. Neither ships a new pattern alone.",
      "The payoff is boring on purpose: every screen looks like it came from the same place, because it did.",
    ].join("\n\n"),
    coverImage: {
      src: "/journal/entry-2.svg",
      alt: "Abstract journal cover — a large outlined circle bisected by a hairline with a blue dot at its centre.",
      width: 1200,
      height: 800,
    },
    author: "MTC",
    publishedAt: "2026-02-02",
    tags: ["design-systems", "branding"],
    status: "published",
    noindex: false,
  },
  {
    id: "post-3",
    title: "Motion should explain, not decorate",
    slug: "motion-should-explain",
    excerpt:
      "The best interface animation is the one you don't notice — it just made the change legible.",
    body: [
      "Animation earns its place when it answers a question the user was about to ask: where did that come from, where did it go, what is loading, what did I just change.",
      "Everything else is cost. Motion delays interaction, competes for attention and ages badly. Our default is none; we add it back one transition at a time, and only when the static version is genuinely harder to read.",
      "Fast, short, and covered by reduced-motion. If it needs a spec longer than a sentence, it is probably decoration.",
    ].join("\n\n"),
    coverImage: {
      src: "/journal/entry-6.svg",
      alt: "Abstract journal cover — an oversized numeral six above a hairline with a blue square.",
      width: 1200,
      height: 800,
    },
    author: "MTC",
    publishedAt: "2026-01-15",
    tags: ["motion", "design"],
    status: "published",
    noindex: false,
  },
  {
    id: "post-4",
    title: "What we mean when we say “editorial”",
    slug: "what-editorial-means",
    excerpt:
      "It is not a serif font and a lot of whitespace. It is hierarchy doing the work that decoration usually does.",
    body: [
      "Editorial design leans on type, scale, spacing and a grid to build order — so it rarely needs borders, cards, shadows or colour to tell you what matters.",
      "That restraint is the point. A page with fewer devices has fewer things to get wrong, and it ages at the speed of the writing rather than the speed of a trend.",
      "When we call a layout editorial, we mean you could remove every rule and box and still know exactly where to look.",
    ].join("\n\n"),
    coverImage: {
      src: "/journal/entry-4.svg",
      alt: "Abstract journal cover — three concentric arcs sweeping from one corner with a small blue dot.",
      width: 1200,
      height: 800,
    },
    author: "MTC",
    publishedAt: "2025-11-04",
    tags: ["design", "craft"],
    status: "published",
    noindex: false,
  },
  {
    id: "post-5",
    title: "Naming is the cheapest way to get positioning wrong",
    slug: "naming-and-positioning",
    excerpt:
      "A name can't fix a weak position, but it can quietly undermine a strong one for years.",
    body: [
      "Naming tends to arrive late, under time pressure, judged by taste in a room. By then the strategy work is done and half-forgotten, so the name gets picked for how it sounds rather than what it has to carry.",
      "We treat the name as the shortest possible expression of the positioning. If the strategy says “clarity”, the name should not need a paragraph to explain itself.",
      "The check is whether the name still makes sense in three years, in a sentence, said out loud.",
    ].join("\n\n"),
    coverImage: {
      src: "/journal/entry-3.svg",
      alt: "Abstract journal cover — diagonal bands in black with one blue band beneath a hairline.",
      width: 1200,
      height: 800,
    },
    author: "MTC",
    publishedAt: "2025-09-10",
    tags: ["branding", "strategy"],
    status: "published",
    noindex: false,
  },
  {
    id: "post-6",
    title: "Ship the boring version first",
    slug: "ship-the-boring-version-first",
    excerpt:
      "The ambitious version is easier to judge once the plain one is live and being used.",
    body: [
      "Every project has a version that is obvious, small and slightly disappointing. We try to ship that one first.",
      "Live software teaches faster than a prototype. Once the plain version is in front of real use, the arguments about the ambitious version get concrete — you can see which parts were worth the risk and which were taste.",
      "It is not a lowering of standards. It is sequencing them.",
    ].join("\n\n"),
    coverImage: {
      src: "/journal/entry-5.svg",
      alt: "Abstract journal cover — two overlapping rectangles, one solid black, with a small blue square.",
      width: 1200,
      height: 800,
    },
    author: "MTC",
    publishedAt: "2025-07-22",
    tags: ["process", "product"],
    status: "published",
    noindex: false,
  },
];
