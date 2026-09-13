# MTC — website

Premium light-mode website for **MTC**, a creative digital agency
(branding · web & app · social & marketing · content).

Stage 1 of a section-by-section build: **foundation, design system,
navigation, homepage shell, and a CMS-ready content architecture.** The
homepage sections (Hero → Final CTA) are intentionally left as anchored
stubs and are built in later stages.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC) · React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`) |
| Motion | framer-motion (`m` + `LazyMotion`, reduced-motion aware) |
| Validation | Zod (CMS content schemas) |
| Content | Provider abstraction — local typed files now, Supabase later |

> Toolchain note: `typescript` is pinned to `6.x` and `eslint` to `9.x`
> because `typescript-eslint` / `eslint-plugin-react` do not yet support
> TS 7 / ESLint 10 in this environment.

## Scripts

```bash
npm run dev        # local dev (http://localhost:3000)
npm run build      # production build + typecheck
npm run start      # serve the production build
npm run lint       # eslint (next/core-web-vitals + next/typescript)
npm run typecheck  # tsc --noEmit
```

Copy `.env.example` → `.env.local`. Stage 1 runs fully on
`CMS_PROVIDER=local` with **no backend**.

---

## Design system

Defined once as CSS variables in **`src/app/globals.css`** under `@theme`,
consumed everywhere through Tailwind utilities.

- **Light mode only.** `canvas` (white) and `paper` (warm off-white) are
  the grounds; `ink` / `ink-muted` is the text.
- **Blue is a strategic accent** — buttons, links, labels, active and
  selected states, thin graphic details. Never a large fill, never a
  gradient. The provisional value is `--color-blue: #1D4BFF`; change that
  one line when the brand blue is confirmed from the logo.
- **Typography:** one variable family (Archivo). The display role
  (`h1–h3`, `.font-display`) pushes the font's width axis toward
  *expanded* via `font-stretch` and tightens tracking; body stays normal.
  Fluid scale: `text-display-1…3`, `text-title`, `text-lead`,
  `text-body`, `text-meta`, `label`.
- **Layout:** `Container` (max-width + gutter), `Grid` (12-col editorial
  grid), `Section` (ground + vertical rhythm).
- **Motion:** shared variants in `src/components/motion/variants.ts`;
  `<Reveal>` for scroll-in. Global `prefers-reduced-motion` reset in CSS.

## Component architecture

```
src/components/
  ui/       Button · Container · Grid · Section · Label · ArrowLink · Logo   (presentational, no data)
  layout/   Navbar · MobileMenu · Footer
  motion/   Reveal · variants
```

`ui/` never imports content. Pages/sections compose `ui/` + data from the
CMS layer. `cn()` (`src/lib/utils.ts`) is the only styling helper.

## The logo

Rendered from static files so the artwork is used **exactly as
delivered** — never recoloured, gradient-ed, distorted, or redrawn.

- `public/brand/mtc-logo.svg` — official **blue** logo (nav, brand touchpoints)
- `public/brand/mtc-logo-mono.svg` — single-ink version (footer)

Both are **placeholders**. Drop the real artwork in with the same
filenames — no code changes needed. See `public/brand/README.md`. If the
real logo's proportions differ, update `ASPECT` in
`src/components/ui/Logo.tsx`.

## Homepage architecture

`src/app/(site)/page.tsx` renders the 12 sections from the brief, in
order, as anchored stubs (`#hero`, `#intro`, `#work`, …). The `(site)`
route group layout supplies `Navbar` + `Footer` and a skip link. Each
real section will become a component in `src/components/sections/` that
reads from the CMS layer.

## CMS architecture

```
src/content/
  schema.ts        Zod schemas — the shape every provider must return
  types.ts         z.infer types
  data/*.ts        local seed content (current source of truth)
src/lib/cms/
  provider.ts      ContentProvider interface (all methods async)
  local.ts         reads src/content/data, validates via Zod   (server-only)
  index.ts         picks provider from CMS_PROVIDER → exports `cms`
```

Every content type carries SEO fields (`seoTitle`, `metaDescription`,
`slug`, `noindex`). The public site and the future `/admin` panel both
call `cms.*` — never files or a database directly.

**Adding Supabase later:** implement `src/lib/cms/supabase.ts` against the
same `ContentProvider` interface (Auth + Postgres + Storage), register it
in `index.ts`, set `CMS_PROVIDER=supabase`. No section component changes.

## SEO

- Per-route metadata via `buildMetadata()` (`src/lib/seo.ts`) — canonical
  URLs, Open Graph, Twitter, robots.
- `src/app/robots.ts`, `src/app/sitemap.ts` (expand from `cms` as routes land).
- Dynamic default OG image at `src/app/opengraph-image.tsx`.
- Organization JSON-LD in the root layout.
- `/admin` is `noindex` (metadata + `X-Robots-Tag` header in `next.config.ts`).

---

## Build roadmap (remaining stages)

1. ✅ Foundation · design system · nav · homepage shell · CMS architecture
2. Hero + Intro/Positioning
3. Selected Work (list + `/work/[slug]`)
4. Services (numbered editorial rows) + `/services`
5. Why MTC · Process · Results
6. Testimonials · Clients · Final CTA + inquiry form
7. Footer final · legal pages · `/studio` · `/journal`
8. Supabase (Auth + DB + Storage) · `/admin` CRUD
