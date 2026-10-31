# MTC — website

Premium light-mode website for **MTC**, a creative digital agency
(branding · web & app · social & marketing · content).
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
| 3D | three.js, for the night chapter's glass squares (tap one to break it) and the glass lens over project pictures; both load on first need |
| Icons | Solar (480 Design, CC BY 4.0) via Iconify, extracted by `scripts/build-icons.mjs`; sticker emojis are Microsoft Fluent Emoji 3D (MIT, `public/media/emoji/LICENSE.txt`) |
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
  the four discipline colours (`hue-*` tokens) on the stickers and the
  journal's hover line.
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
word; `data-reveal="up" | "fade" | "stagger"` reveal once; `"media"` grows a
frame to full size under scroll (transforms only, and only with a mouse or
trackpad: on touch screens the frames hold still); `"sheet"` widens the
night chapter; `"ink"` (`InkText`)
lights a paragraph up word by word as it scrolls through. An inline script
marks `<html class="motion">` before first paint, and only then do these
elements start hidden; with reduced motion, without JavaScript, or if the
scripts fail to arrive, everything renders in its final state and Lenis never
starts.

Homepage (`src/app/[locale]/(site)/page.tsx`):

1. **Opener** (`Hero`): the headline, "Oh look, you found us", in heavy
   capitals fitted to the column (three lines at most on phones), its
   letters thinning out near the pointer, each in a box of fixed width so
   nothing shifts (still on touch screens; `FitLetters`); four colourful
   stickers, two of them 3D emojis, that pop in
   and can be dragged (`ui/Sticker`); the two actions; the real client logos
   on a slow loop (`TrustedBy`).
2. **Showroom**: featured projects as large night and mist tiles, each with
   "View case study" and "View live site" (`ProjectTile`). With a mouse, a
   small square of glass replaces the pointer everywhere (24px, 32px over
   anything that can be clicked; the text caret in fields). In Chrome and
   Edge it zooms what is under it very slightly (`glass-refraction.ts`);
   elsewhere it is clear glass. Over every
   picture it becomes the glass lens that magnifies it (`WorkLens`,
   `work-lens.ts`, on any `[data-lens]` box). WebGL can only read pictures
   from this site or ones fetched with CORS, so the cover films from
   Supabase Storage load with `crossorigin` (it allows any origin); over a
   picture the lens can't read, the glass cursor simply carries on. Phones
   and tablets have no glass at all: no cursor and no lens.
3. **Night chapter**: "How we work" lit word by word over glass squares that
   break when clicked or tapped and grow back (`StudioStatement`,
   `GlassSquares`, `glass-scene.ts`), then the four services with where each
   was used (`Disciplines`).
4. **Client words** (`ClientWords`): one quote at a time with a filling line,
   arrows and the count; only real, published quotes.
5. **Journal**: the five newest notes as a ruled list.

The homepage closes with the footer's sign-off: "LET'S TALK." in the hero's
fitted capitals with the same letter effect and three stickers (a "hey!"
bubble, a waving hand, "Open for new projects"), then the email copy, email
and phone (`SignOff`, on the homepage only). Navigation is a top bar, its
pages centred, plus a dark floating dock that appears once the opener has
gone (`Navbar`). The Studio page is switched off for now (`studioPageEnabled`
in `src/config/site.ts`): it answers 404 and is left out of every menu and the
sitemap.

## Legal and privacy

- Legal pages (English in every language, `src/app/[locale]/(site)/legal/`):
  Privacy Policy, Terms of Use, Cookie Policy, Refund Policy ("the signed
  agreement comes first") and Legal notice (business details, then credits
  and licences for Inter, Solar, Fluent Emoji and the code libraries). "Your
  data" (`/legal/data-request`, translated) takes requests for a copy,
  correction or deletion of personal data; they land in /admin/contact,
  where any message can now be deleted for good.
- **Business details**: `businessDetails` in `src/config/site.ts` (registered
  name, legal form, address, registration, fiscal and VAT numbers,
  representative). Each one appears on the legal notice, the legal pages'
  contact blocks and (the numbers) the footer once it is filled in.
- **Google Analytics and the Meta Pixel** are set up by their IDs alone:
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_META_PIXEL_ID`
  (`src/config/tracking.ts`). With an ID set, a cookie banner asks first
  (`ConsentBanner`): "Reject all" and "Accept all" side by side, or one switch
  per kind; the choice is kept six months in `mtc_consent` and can be changed
  under "Cookie settings" in the footer. Nothing loads before consent
  (`Trackers`); withdrawing it clears their cookies and reloads the page. The
  privacy and cookie policies describe each tool only while its ID is set.
  Without IDs there is no banner in production; `next dev` shows it anyway
  so it can be tried.
- The contact form asks the sender to confirm they are 16 or older and have
  read the Privacy Policy (never pre-ticked; checked on the server too).
- The site sends no email to visitors (only notifications to the studio
  inbox), so it has no mailing list to unsubscribe from. A newsletter would
  need its own opt-in and an unsubscribe link in every email.
- Text is ink or ink-muted; the faint greys are kept for icons and hairlines.

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
- Client words ("In Our Clients' Words."): the seed holds the four real
  quotes (Balkan Bee, AS-MED, Leo Malerbetrieb GmbH and Pixel Print), each
  with the service under the company; the clients' names are still to
  come. **The live site reads them from its database**, so enter each in
  /admin → Testimonials: Company, Role (the service, e.g. "Branding"),
  the quote, Client name left empty, and tick "Active". Once a name is
  in, it leads and the line under it reads "Role, Company" (put the
  person's role in Role then). Unpublished entries show on a development
  server only, marked "Draft".
- Portfolio media (images, cover videos, client logos, journal covers) was
  copied from the live site into `public/media/`.

## SEO

- Per-route metadata via `buildMetadata()` (`src/lib/seo.ts`) with canonical
  URLs, hreflang alternates, Open Graph and Twitter.
- Localized 404 for any unmatched public URL (`[locale]/(site)/[...missing]`).
- Dynamic Open Graph image per locale; Organization JSON-LD.
- `/admin` is `noindex`.

## Troy Residence concept (`/troy`)

A presentation website made for Troy Construction's **Troy Residence**
(three towers in Mitrovica), at `/troy` in Albanian and `/troy/en` in
English. It is a site of its own beside the MTC site: its own root layout,
stylesheet and copy, passed through untouched by the proxy, kept out of
search engines (`noindex`) while it is a concept.

**Brand.** Troy's navy (`#012f47`) and gold (`#eed09a`–`#b28c41`), taken
from the logo, on white and a soft blue sky; Inter throughout, headings
light with their key words bold (marked `*like this*` in the copy and set
by `Rich`). The logo (`public/troy/logo.webp`, also the favicon) is cut
from the emblem Troy supplied; the photographs are stills from Troy's own
films (`public/troy/photos/`, the player bar and watermark cropped out).

The page opens with **"Kryevepra e Qytetit"** over a close-up of Block C
rising out of mist. Scrolling pulls the camera back until all three towers
stand in view (the scene is pinned while it does), and the interactive
model takes over:

1. **Blocks.** Hover a tower and it lifts out of the dimmed picture; pins
   over the roofs give floors and availability.
2. **Floors.** The camera glides to the chosen block; hovering a floor
   lights its windows. The panel lists every floor.
3. **The floor in 3D.** The camera flies into the floor and a three.js
   maquette rises (walls cut at 2.3 m, glass, furniture, balconies,
   green roofs on the penthouse floors), loaded only now. A 2D plan of the
   same floor is one click away.
4. **The home.** The model frames it and names its rooms; the panel gives
   areas, a measured plan and WhatsApp, call and offer buttons (the offer
   fills in the contact form).

The view lives in the address (`/troy?b=A&f=7&u=A-701`), so a home can be
sent as a link, and the back button and Escape step back a level. Below
the model: the project (a pinned frame travelling over the render, and
Troy's poster), a gallery, the construction so far (the stages named in
Troy's site film), the location, and a contact form that writes the message
into WhatsApp or an email (nothing is sent or stored by the site).

```
src/app/troy/          layout, the two pages, troy.css, icons
src/troy/data/
  facade.ts            the render's geometry: tower outlines, floor bands
  plans.ts             floor plates, home templates, walls and doors
  furniture.ts         furniture placed by rule in every room
  inventory.ts         availability, summaries, lookups
src/troy/scene/        the 3D floor (three.js)
src/troy/components/   Explorer (opening + model), panels, plan, sections
src/troy/i18n.ts       Albanian and English copy, contacts
```

**Illustrative data.** The floor plans, areas and availability are
generated stand-ins, and the footer says so. With Troy's real material:
their plans replace the templates and slots in `plans.ts` (the 3D model,
2D plans and areas follow), their sales list replaces `statusOf` in
`inventory.ts`, and prices can join the unit panel. The project facts in
the copy come from Troy's own page and films (three towers, central
Mitrovica, the Ibar and the mountains, 30,000+ m² of structural works by
March 2024, the construction stages, address and contacts).
