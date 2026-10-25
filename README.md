# MTC — website

Premium light-mode website for **MTC**, a creative digital agency in
Mitrovica, Kosovo (branding · web & app · social & marketing · content).
Public site in English, German and Swedish, with a small CMS and admin panel.

The current design is the **"Keynote"** redesign: the work presented like
product. White and Apple-grey grounds, one black chapter, Inter throughout,
near-black ink and the logo's blue as the only interface accent; the project
films and stills supply every other colour. The art direction lives in
[`docs/redesign/keynote-direction.md`](docs/redesign/keynote-direction.md);
earlier research and the content inventory sit beside it.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Without a `.env.local` the site runs on the local content seed in
`src/content/data` (no database, no email). See `.env.example` for the
production variables.

```bash
npm run build      # production build + typecheck
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Turbopack) · React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`) |
| Motion | GSAP + ScrollTrigger (`src/lib/gsap.ts`), driven from markup attributes by `MotionRoot`; Draggable for the hero stickers |
| Smooth scrolling | Lenis, the only scroll engine, on GSAP's ticker and feeding ScrollTrigger |
| 3D | three.js, for the night chapter's glass squares only (loaded when the section comes near) |
| Icons | Solar (480 Design, CC BY 4.0) via Iconify, extracted by `scripts/build-icons.mjs` |
| Validation | Zod (CMS content schemas) |
| Content | Provider abstraction: local seed in dev, Postgres (Supabase) in production |

## Design system

Defined once in **`src/app/globals.css`** and consumed through Tailwind
utilities. Token names the admin panel uses are kept.

- **Grounds:** `canvas` (white), `mist` (`#f5f5f7`), `night` (black) with
  `night-soft` tiles. `frost` and `paper` are aliases of mist for the admin.
- **Ink:** `ink`, `ink-muted`, `ink-faint` on light; `snow`, `snow-muted`,
  `snow-faint` on night.
- **Accent:** `blue` (`#0b45ff`, from the logo) for links, focus and
  selection on light; `sky` on night. Nothing else is coloured, apart from
  the journal's hover line in the four discipline colours.
- **Type:** Inter via `next/font` with its optical-size axis, so display sizes
  get Inter's tighter cut on their own. Roles: `text-display-hero`,
  `text-display-1…3`, `text-title`, `text-lead`, `text-eyebrow`, `text-body`,
  `text-meta`. Eyebrows are sentence case and used sparingly.
- **Shape:** large radii (tiles 28–36px, media 20–26px, pills), hairline rims
  on media (`media-rim`), soft neutral shadows. Frosted glass only on the
  navigation dock.

## Motion

`MotionRoot` (`src/components/motion/MotionRoot.tsx`) wraps each page's
content and turns attributes into GSAP choreography, reverting everything on
navigation: `data-split` headings (split into words on the server by
`SplitWords`, with the full text kept for assistive technology) rise in word by
word; `data-reveal="up" | "fade" | "stagger"` reveal once; `"media"` unveils a
frame under scroll; `"sheet"` widens the night chapter; `"ink"` (`InkText`)
lights a paragraph up word by word as it scrolls through. An inline script
marks `<html class="motion">` before first paint, and only then do these
elements start hidden; with reduced motion, without JavaScript, or if the
scripts fail to arrive, everything renders in its final state and Lenis never
starts.

Homepage (`src/app/[locale]/(site)/page.tsx`):

1. **Opener** (`Hero`): the headline in heavy capitals fitted to the column,
   its letters thinning out near the pointer; four stickers that pop in and
   can be dragged; the two actions; the real client logos on a slow loop
   (`TrustedBy`).
2. **Showroom**: featured projects as large night and mist tiles.
3. **Night chapter**: "How we work" lit word by word over thin glass squares
   (`StudioStatement`, `GlassSquares`, `glass-scene.ts`), then the four
   services with where each was used (`Disciplines`).
4. **Client words** (`ClientWords`): one quote at a time with a filling line,
   arrows and the count; only real, published quotes.
5. **Journal**: the five newest notes as a ruled list.

Every page closes with the footer's sign-off: "Let's talk." fitted to the full
width, the call to action, email, phone and the studio's local time
(`SignOff`, hidden on /contact). Navigation is a top bar plus a dark floating
dock that appears once the opener has gone (`Navbar`).

## Content

```
src/content/
  schema.ts        Zod schemas: the contract every provider returns
  data/*.ts        local seed (real projects, clients and posts from mtcmarketing.co)
  i18n/de.ts, sv.ts  German and Swedish overlays for CMS copy
src/i18n/dictionaries/  UI strings (en is the source of truth, de/sv typed against it)
```

- Homepage, studio and site settings copy live in code (`src/content/data/`)
  and ship with the site.
- Projects, services, posts, clients, testimonials and team come from the
  CMS database in production; the local seed only feeds development. **Copy
  changed in the seed (e.g. the new service summaries) must also be entered
  in /admin to appear on the live site.**
- Team members and statistics are not published anywhere because none exist
  yet; their sections stay hidden until real ones are published in /admin.
- Client words: the seed holds five **drafts** (placeholder quotes, names and
  roles for Balkan Bee, AS-MED, Leo Malerbetrieb, Summit Balkans and Pixel
  Print) so the section can be judged on a development server, where they
  show marked "Draft". They are unpublished and never reach a production
  build. Replace each with the client's real words in /admin and tick
  "Published".
- Portfolio media (images, cover videos, client logos, journal covers) was
  copied from the live site into `public/media/`.

## SEO

- Per-route metadata via `buildMetadata()` (`src/lib/seo.ts`) with canonical
  URLs, hreflang alternates, Open Graph and Twitter.
- Localized 404 for any unmatched public URL (`[locale]/(site)/[...missing]`).
- Dynamic Open Graph image per locale; Organization JSON-LD.
- `/admin` is `noindex`.
