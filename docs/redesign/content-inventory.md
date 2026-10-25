# Content inventory (live site, read 23 October 2026)

Everything below was taken from the public pages of https://www.mtcmarketing.co.
It is the factual base for the redesign: nothing outside this list is presented
as fact on the new site. Items marked **placeholder** are proposals that need
real content before they can go live.

## Company

| Fact | Value | Source |
|---|---|---|
| Name | MTC (legal name shown in footer: MTC Digital Agency) | Footer |
| Positioning | Creative digital agency | Hero label, page titles |
| Location | Mitrovica, Kosovo | Footer, contact page |
| Email | info@mtcmarketing.co | Footer, contact page |
| Phone | +383 49 277 977 | Footer, contact page |
| Instagram | https://www.instagram.com/mtc.marketing/ | Footer |
| LinkedIn | Link points to linkedin.com root (no company page found) | Footer |
| Languages | English, German, Swedish | Language switcher |

## Services (four disciplines)

| # | Discipline | Capabilities listed on the site |
|---|---|---|
| 01 | Branding & Visual Identity | Brand strategy & positioning; Naming & messaging; Logo & identity systems |
| 02 | Web & App Development | UX & UI design; Next.js / React builds; Headless CMS integration |
| 03 | Social Media & Digital Marketing | Channel & content strategy; Paid social & search; Community management |
| 04 | Content Creation & Advertising | Creative concepts; Photography & film; Motion & animation |

The CMS seed carries two more capabilities per discipline (e.g. "Art direction &
guidelines", "Performance & Core Web Vitals", "Analytics & reporting",
"Copywriting"); these are kept.

Studio principles (from /studio): Clarity; Strategy first; Creative always;
Built to ship. Process (from the CMS seed, not shown on the live homepage):
Discover, Define, Create, Launch.

## Portfolio (6 case studies)

| Project | Year | Category | Services listed | Website | Media |
|---|---|---|---|---|---|
| Balkan Bee | 2026 | Branding & Visual Identity | Brand strategy; Logo & visual identity; Social media | balkanbee.com | 13 images, cover video |
| AS-MED | 2026 | Web App | Web App | none | 5 images, cover video |
| Leo GmbH | 2026 | Web Development & Maintenance | Web Design; Web Development; Responsive Design | leogmbh.net | 4 images, cover video |
| Summit Balkans | 2026 | Branding & Visual Identity | none listed | summitbalkans.com | 15 images |
| Pixel Print | 2024 | Branding & Visual Identity | Brand Strategy; Logo Design; Visual Identity; Brand Applications; Print Design | none | 18 images, cover video |
| D12 Construction & Engineering | 2025 | Branding & Visual Identity | none listed | none | 12 images |

Facts stated in the case studies: BalkanBee is a second-hand marketplace for the
Balkans (honeycomb parcel mark, red-to-amber palette, "built for trade");
AS-MED is a custom healthcare management system (patient records, clinical
documentation, ICD-10 coding, analytics, audit tracking); Leo GmbH is a
Vienna-based construction and renovation company; Summit Balkans is an
adventure and outdoors brand; Pixel Print is based in Mitrovica, Kosovo; D12 is
a construction and engineering company.

Homepage feature order on the live site: Balkan Bee, AS-MED, Leo GmbH, Pixel
Print. All media was downloaded into `public/media/` (about 26 MB).

## Clients ("Trusted by" strip)

Balkan Bee, AS-MED (Ordinancë Specialistike), Leo Malerbetrieb GmbH, Summit
Balkans, Pixel Print, D12 Construction & Engineering, MTC Group. Four of these
logos carry the alt text "Placeholder logo" on the live site; the names above
were read from the artwork itself.

## Journal (5 posts, all by MTC)

| Date | Title | Topics |
|---|---|---|
| 6 Oct 2026 | Meta Is Giving AI More Control Over Advertising | Meta Ads, AI, Performance Marketing |
| 5 Oct 2026 | ChatGPT Is Opening a New Channel for Advertising | AI, Digital Marketing, Advertising |
| 5 Oct 2026 | AI Is Changing How Advertising Results Are Measured | Performance Marketing, Analytics, AI |
| 20 May 2026 | Google Is Changing How Search Works | SEO, AI Search, Content Marketing |
| 6 Oct 2025 | Instagram Is Pushing Marketing Further Toward Video | Social Media, Content, Video Marketing |

## Not on the live site (so not presented as fact)

- **Testimonials:** none published. The new homepage has a testimonials slot
  that stays hidden until real, attributed quotes are added in /admin; in local
  development it shows a clearly labelled **placeholder** notice instead.
- **Team members:** none published. The studio page shows no team.
- **Statistics, awards, client results:** none published. The old CMS seed
  carried invented figures ("+120 campaigns", "3.8x ROAS") marked as
  placeholders; they are not used anywhere.
- **LinkedIn company URL:** not available.
- **The ice-cube screenshot** mentioned in the brief did not come through.

## Issues found on the live site

- Footer link "Services" goes to `/services`, which is a 404. The new footer
  links to the homepage services section.
- On the homepage the language switcher links to `/de/en` and `/sv/en`
  (the internal `/en` rewrite leaks into the path). Fixed in
  `src/i18n/paths.ts`.
- Several client logos have placeholder alt text (see above).
