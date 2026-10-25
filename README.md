# MTC — website

Premium light-mode website for **MTC**, a creative digital agency in
Mitrovica, Kosovo (branding · web & app · social & marketing · content).
Public site in English, German and Swedish, with a small CMS and admin panel.

The current design is the **"Clear ice"** redesign: white and frost grounds,
the logo's blue as the interface accent, four discipline hues, Archivo with
its variable width axis, and a real-time WebGL ice cube as the hero object
and the centrepiece of the services section. Background, research and the
content inventory live in [`docs/redesign/`](docs/redesign/).

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
| Scroll motion | Scroll Craft engine (vendored, `src/vendor/scrollcraft/`) driven by `data-sc-*` attributes |
| Smooth scrolling | Lenis |
| UI motion | framer-motion (mobile menu, route transitions) |
| 3D | three.js (lazy-loaded, client only) for the ice cube |
| Validation | Zod (CMS content schemas) |
| Content | Provider abstraction: local seed in dev, Postgres (Supabase) in production |

## Design system

Defined once in **`src/app/globals.css`** and consumed through Tailwind
utilities. Token names used by the admin panel are kept.

- **Grounds:** `canvas` (white), `frost` (cool off-white). `paper` is an alias
  of frost for the admin.
- **Ink:** `ink`, `ink-muted`, `ink-faint` (faint is for non-essential text).
- **Accent:** `blue` (`#0B45FF`, from the logo gradient), `sky`.
- **Discipline hues:** `amber`, `azure`, `coral`, `mint`, each with `-tint`
  and `-ink` shades. Mapped to services by id in `src/lib/disciplines.ts`.
- **Type:** Archivo (variable, width 62–125) via `next/font`. Display type
  (`text-display-hero`, `text-display-1…3`) runs expanded on the width axis;
  body copy at normal width.
- **Shape:** radius `xs/sm/md/lg/pill` (6/12/20/28px), pill buttons and chips,
  `frost-edge` rims, shadows tinted to the ink.
- **Ice glint:** `.ice-glint` on a surface (and `.glint-group` on its
  trigger) runs a specular streak across it on hover. Fine pointers only.

## Motion (Scroll Craft)

The scroll choreography uses the Scroll Craft plugin's engine, vendored
unchanged in `src/vendor/scrollcraft/` (see its README). `ScrollCraftRoot`
mounts it on each page, destroys it on navigation, re-measures when content
height changes, and reveals content rendered after mount.

Homepage acts (plan and reasoning in `scrollcraft/builds/mtc-home/BRIEF.md`):

1. **Hero** – flow act with parallax planes; the ice cube leans toward the
   pointer and turns as the hero leaves.
2. **Recent work** – `pan` act: the featured projects slide sideways.
3. **Statement** – flow act with `kinetic` line reveal.
4. **Four sides** (services) – pinned act; the cube turns one face per
   discipline and the stage takes that discipline's tint (`src/lib/facets.ts`).
5. **How we work** – flow act with `reveal` wipes.
6. **Proof** – client logos, client words (only when real ones exist), journal.
7. **Inquiry desk** – discipline chips whose selection is carried into the
   contact form (`/contact?services=…`), magnetic CTA.

Reduced motion keeps every word: fades stay, movement goes, the work reel
becomes an ordinary horizontal scroller and the cube snaps between faces.

`Reveal` (`src/components/motion/Reveal.tsx`) is a server-rendered wrapper
around the engine's `data-sc-in` flow reveal.

## The ice cube

`src/components/ice/ice-scene.ts` (three.js) renders a rounded ice cube with
physical transmission, dispersion and a procedural frost map, four coloured
cores (one per discipline) and light spilling onto the floor.
`IceCube.tsx` lazy-loads it, renders only while it is on screen, and shows a
poster still (`public/media/ice/`) without WebGL, with Save-Data, or until
the first frame paints. Regenerate the posters from the running dev server
with `scrollcraft/builds/mtc-home/capture-posters.mjs`.

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
- Testimonials, team members and statistics are not published anywhere
  because none exist yet; the homepage shows a clearly labelled placeholder
  for testimonials in development only.
- Portfolio media (images, cover videos, client logos, journal covers) was
  copied from the live site into `public/media/`.

## SEO

- Per-route metadata via `buildMetadata()` (`src/lib/seo.ts`) with canonical
  URLs, hreflang alternates, Open Graph and Twitter.
- Localized 404 for any unmatched public URL (`[locale]/(site)/[...missing]`).
- Dynamic Open Graph image per locale; Organization JSON-LD.
- `/admin` is `noindex`.

## Verification

`scrollcraft/builds/mtc-home/` holds the Scroll Craft brief, the
verification harness dependencies and helper scripts (`snap.mjs` for
full-resolution screenshots, `capture-posters.mjs`).
