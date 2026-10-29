# Keynote: art direction

Third redesign of mtcmarketing.co (branch `claude/redesign-apple`). Brief from
the owner: an award-quality redesign inspired by dovvstudio.com, showcasing
MTC's work, Apple-like, minimal colour, set in Inter, and as good on a phone as
on a desktop.

**Iteration 2** (owner's feedback, 2026-10-25): the opener becomes a type-led
hero with stickers and the client logos instead of the film stage; the brand
assembly goes (too little material for it) and so do the process cards; the
night chapter opens with a paragraph that lights up as you scroll, over thin
glass squares; client words get a Dovv-like slider; the journal becomes the
ruled list from the Scroll Craft redesign. The navigation (top bar, then the
bottom dock) stays as it was.

**Iteration 3** (2026-10-26): black and white felt too serious, so the
stickers take MTC's four colours with a Dovv-like shine, and two are 3D emojis
(eyes and a rocket in the hero; a speech bubble and a waving hand in the
footer). The glass squares get the material of a clear-glass reference: small
rounded corners, a slightly thicker bevelled slab, light inside the faces,
bright edges and only a faint cool tint. On touch screens the letter effect
plays by itself as a slow drift. The footer's "Let's talk." gets the hero's
treatment, like Dovv's "SAY HELLO".

**Iteration 4** (2026-10-26): to move further from Dovv, "Made in Kosovo" (too
close to Dovv's "Made in Argentina") and the disciplines sticker become
"Say hi!" and "Ready when you are". Projects are presented with their own
description in calm, larger text, with "View case study" and "View live
site", on the homepage and the case studies. Two playful ideas of MTC's own:
a glass lens that follows the pointer over project pictures, and glass
squares that break when tapped and grow back. Fixed: the stickers' shine
leaking at their corners, and panes that could pass through each other.

**Iteration 5** (2026-10-27, getting ready to launch): the lens becomes very
small (a loupe of 56 to 84px) and works on every picture on the site: the
work tiles, the case-study cover, gallery and next-project pictures, and the
journal's covers. The homepage tiles drop the description again (it stays on
the case studies). The footer's speech-bubble emoji becomes a "hey!" bubble
sticker in MTC's amber. A full phone pass found no page wider than a 360px
screen.

**Iteration 6** (2026-10-27, launch checklist): the header's pages sit exactly
in the middle of the bar. "LET'S TALK." closes the homepage only, and its row
keeps just the email copy, email and phone (no second call to action, no
place and time). The Studio page is switched off (`studioPageEnabled` in
`src/config/site.ts`; it answers 404 and leaves every menu and the sitemap).
The brief's "What do you need?" chips take the four discipline colours, and
the form's fields focus with an ink edge instead of blue. Legal and privacy:
a refund policy, a legal notice with the business details and credits, a
"Your data" request page, a rewritten privacy policy and cookie policy, a
cookie banner for Google Analytics and the Meta Pixel (neither loads without
consent, or without its ID), a 16+ / Privacy Policy tick on the contact form,
deletion of messages in /admin, and darker greys wherever the faint ones were
used for text.

**Iteration 7** (2026-10-27): the lens becomes the mouse pointer. With a mouse
or trackpad a small square of the lens's glass replaces the pointer on every
page: 24px, growing to 32px over anything that can be clicked (and over the
breakable glass squares), a touch smaller while pressed, and the usual caret
in text fields. Over a picture it turns into the magnifying lens, now 32px
everywhere (it was 56 to 84px). Phones, reduced motion and forced colours
keep their usual pointer. A zooming version of the cursor (an SVG
displacement filter on its backdrop, Chromium only) was tried at 1.25x
with a colour split: at this size the resampled page showed stretched,
coloured pixels. It came back as a very slight zoom only (about 1.05x, no
bend, no colour split, `glass-refraction.ts`).

**Iteration 8** (2026-10-29, owner's words): the headline becomes "Oh look,
you found us" (German "Oh, Sie haben uns gefunden", Swedish "Åh titta, du
hittade oss"). On phones its words take the largest size at which they wrap
into three lines at most ("OH LOOK, / YOU / FOUND US"), because one short
word per line ran five lines tall and pushed the actions off the first
screen. The glass is now for the mouse only: on touch screens the lens no
longer drifts over the pictures (the owner found a lone square of glass
over a photo odd without a pointer to follow). Client words carry the
clients' real quotes, the company leading with the service under it until
their names are in. The owner then rewrote the page's copy in their own
words: the hero line under the headline ("Creative thinking. Digital
doing."), the work and journal headings, the "How we work" paragraph and
its four stages, and the four service summaries.

**Iteration 9** (2026-10-29, the site's health, measured with PageSpeed on
the live site: mobile performance 80, accessibility 96). Phones were doing
5.3 s of style and layout work in the test, nearly all of it the letter
drift restyling the headline on every frame; it also looked jittery, as a
thinner Inter letter is a narrower one and the centred lines slid about. So
the letters hold still on touch screens, and every letter now keeps a box
of fixed width, which keeps the lines still under the pointer too. The
work tiles' unveil was a clip-path, repainting the frame (film and all) on
every frame of the scroll: it is a transform now, with a mouse only. The
stickers' shine no longer drifts by itself on touch screens (a non-
composited background animation), cover films wait for the page's load
event, the stylesheet is inlined into the HTML (`inlineCss`), the unlit
words of the night chapter's paragraph rise from 16% to 40% (3.4:1, enough
for text that size), and each "View live site" link names its project.

## What was taken from the references

- **dovvstudio.com**, high-level traits only: a centred, heavy, all-caps
  headline across the full width whose letters thin out near the pointer
  (a variable-font weight effect), tilted stickers on its corners that pop in,
  answer the hover with a spring and can be dragged, real client logos on a
  loop right under the actions, a dark chapter whose paragraph lights up word
  by word, and a quote slider with a filling progress line, arrows and a
  count, and a footer line treated like the headline with stickers around
  it. MTC's own words, facts and logos throughout; Inter instead of Dovv's
  condensed face; stickers in MTC's own colours; licensed 3D emojis instead
  of drawn illustrations; no rating, no counter (no verified figure exists).
- **laboiteaslides.fr**: the idea of glass shapes drifting in 3D behind the
  type. Here they are squares, much thinner, monochrome, on black.
- **A clear-glass render the owner supplied**: the material only (clear glass
  with light inside it and bright bevelled edges), with a much fainter tint.
- **MTC's Scroll Craft redesign** (the owner's own earlier build): the
  journal's ruled list with the four-colour line on hover.
- **Dovv's case-study overview**: the calm way a project is described (a
  plain paragraph a step above body size, then "View Live Site").
- **A work grid with an ink hover** (a recording the owner shared): only the
  idea that the work should answer the pointer. Here it is a glass lens, in
  the same glass as the night chapter.

## Visual thesis

**Work, presented like product.** A quiet monochrome stage (white, Apple grey
`#f5f5f7` and one deep black chapter) where MTC's real projects are unveiled
one at a time, at scale. The only saturated colour is the work itself, the
logo's blue as the interface accent, and the four discipline colours where
the page plays: the stickers and the journal's hover line.

## Hero focal asset

The **headline itself**: "OH LOOK, / YOU FOUND US" in Inter at weight 900,
fitted so its widest line spans the column (on phones the words wrap, at the
largest size that keeps them to three lines). Each letter is its own box;
with a mouse or trackpad the letters near the pointer drop toward weight 200
and fill back in as it moves on, each in a box of fixed width so the line
never shifts; on touch screens the letters hold still. Four stickers sit on
its corners:
"Say hi!" (red to pink), a 3D eyes emoji (for "Oh look", tilted 20° so
its leftward gaze falls on that word), a 3D rocket (launches) and "Ready
when you are" (blue to violet).
The pill above names the agency and its three languages. Static first frame:
everything in place at full weight.

## Type

Inter (variable, with its optical-size axis), self-hosted through `next/font`.

| Role | Size | Weight / tracking |
| --- | --- | --- |
| Hero | fitted to the column (≤168px; ≤96px when wrapping) | 900, caps, -0.035em, 0.9 leading |
| Display 1 | clamp(2.5rem → 5.25rem) | 600, -0.04em |
| Display 2 | clamp(2rem → 4rem) | 600, -0.035em |
| Statement | clamp(1.75rem → 3.75rem) | 600, -0.035em |
| Quote | clamp(1.75rem → 3.5rem) | 600, -0.032em |
| Display 3 | clamp(1.625rem → 2.5rem) | 600, -0.028em |
| Title | clamp(1.25rem → 1.75rem) | 600, -0.02em |
| Lead | clamp(1.125rem → 1.375rem) | 400, muted |
| Body | 17px / 1.55 | 400, -0.012em |
| Meta | 14px | 400–500 |

Eyebrows are sentence case, semibold and grey, used sparingly. No em dashes
anywhere visible.

## Colour

`#ffffff` canvas, `#f5f5f7` mist, `#1d1d1f` ink, `#6e6e73` muted, `#86868b`
faint, `#d2d2d7` hairline, `#000000` night. Accent: the logo blue `#0b45ff` on
light, `#2997ff` on dark. The four discipline colours (`#ff5b47`, `#ffb21e`,
`#12b886`, `#1764ff`) are the `hue-*` tokens: each sticker blends one toward a
brighter neighbour under a white edge and a soft rainbow shine that follows
the pointer (and rests in the middle on touch screens), and the journal's hover line runs
through all four. Errors use `#d70015`.

## Sequence (homepage)

1. **Opener**: pill, fitted headline with stickers, one line, two actions,
   then "Brands we've worked with" between hairlines over the seven real
   client logos on a slow loop. Fills the first screen.
2. **Showroom** (the peak): featured projects as very large tiles, alternating
   a black full-width tile and pairs on mist; with a mouse, each grows to
   full size as it arrives.
   Under each picture: the name, discipline and year, "View case study" and,
   when there is one, "View live site". The glass cursor turns into a small
   lens over the pictures (phones have neither).
3. **Night chapter**: "How we work" as one large paragraph whose words light
   up as it scrolls through, the four stages set small beneath it; thin glass
   squares drift and turn behind it in a layer that holds still while the
   section passes; click or tap one and it breaks into shards that fall away,
   then a new one grows in its place. Then the four disciplines as ruled rows.
4. **Client words**: one quote at a time, set large, its words going from grey
   to ink; beside it a line that fills over eight seconds, arrows and the
   count. Only shows real, published quotes (see Content below).
5. **Journal**: "Worth Knowing" and the five newest notes as a ruled list;
   hover draws the four-colour line and fills the arrow.
6. **Sign-off** (the homepage's footer only): "LET'S TALK." in the hero's
   fitted capitals as the link to the brief (letters thinning near the
   pointer), with a "hey!" speech bubble, a waving hand
   and "Open for new projects" around it; then the email copy, email and
   phone.

Tell-someone sentence: *it's the site where the headline thins out under your
mouse and you can pick the stickers up and move them.*

## Motion

GSAP is the only animation system: the hero's intro (pill, letters in turn,
line and actions, stickers popping in with an overshoot), Draggable for the
stickers (mouse and trackpad only, so touch scrolling is never caught),
ScrollTrigger for the night chapter's ground, the lit paragraph and the glass
squares' scroll progress, and server-split headings that rise in word by
word with the unsplit text kept for assistive technology. The letter weights
(`FitLetters.tsx`) follow the pointer in a small requestAnimationFrame loop
that stops as soon as every letter has settled; on touch screens there is
no loop at all. The
glass lens and the breaking panes run on GSAP's ticker too, and only while
they are in use or on screen. **Lenis** is the sole smooth-scroll engine
(chosen over Locomotive Scroll: already in the stack, native scrolling for
sticky and touch, and Locomotive v5 is itself built on Lenis), driven from
GSAP's ticker and feeding ScrollTrigger. CSS handles hover, focus and tap
states, the sticker springs and the quote words. Under
`prefers-reduced-motion: reduce` there is no smooth scrolling, no scrubbing,
no pointer weights, no autoplay and no hidden start state: every section is
in its final state, and the glass squares are a still image.

## Three.js

Used for the glass squares (`src/components/sections/glass-scene.ts`):
twelve squares with small rounded corners (seven on phones), thin bevelled
slabs at different depths, one shared geometry and one small shader. It
treats them as clear glass in a small studio: the faces show its light bent
through them, split a little by colour, with a soft band of light that slides
across as each pane turns; the bevels and edges catch it brightly; the cast is
only faintly cool. Faces that pass behind the paragraph are held to a faint
sheen so white text stays readable over them, and no two panes can ever pass
through each other. Scroll lifts and turns them, a pointer tilts the group.
A click or tap breaks a pane at that point: cracks run out to its edge and a
ring crack splits each wedge, the shards fly apart, spin, fall and fade, and
a new pane grows back after a pause. It earns its place by giving the night
chapter depth without adding colour or competing with the work. three.js is fetched only as the section
comes near; the scene draws on GSAP's ticker only while the section is on
screen and the tab visible, caps the pixel ratio (1.5, 1.25 on phones), and
disposes everything on navigation. With reduced motion, without JavaScript,
without WebGL or after a lost context, a still of the same scene shows
instead (`public/media/glass/squares.webp`, rendered from the scene itself).

The glass lens (`src/components/sections/work-lens.ts`, `WorkLens.tsx`) is a
second canvas the size of the lens (32px), moved to any picture marked
`data-lens` across the site: it samples that picture's own playing film or
still, magnifies it a little, bends it outward toward the rim and splits it
by colour there, under a hairline of light and a soft shadow. It loads on
first use, renders only while shown, and is absent on touch screens, with
reduced motion or without WebGL. Everywhere else the same glass is the cursor, drawn in CSS
(the lens's corners, rim, sheen and halo, without the magnifying), which
fades out as the lens fades in over a picture. WebGL reads only pictures
from the site itself or fetched with CORS: on the live site the cover
films come from Supabase Storage, so they load with `crossorigin`
(Supabase answers "*"); without it the lens drew a black square there.
Over any picture it can't read the lens stays off and the cursor stays.

## Assets and provenance

All imagery is MTC's own: project stills and cover films (copied from the live
site into `public/media/` on the earlier redesign branch), the seven client
logos from the live site's client strip, and the MTC logo from `public/brand/`.
The glass still is a frame of the site's own WebGL scene. The three sticker
emojis (eyes, rocket, waving hand) are Microsoft's Fluent Emoji 3D (MIT
licence, `public/media/emoji/` with its LICENSE.txt), converted to small WebP
files; the "hey!" bubble is Solar's round chat icon filled with MTC's amber. No generated or stock
imagery, no drawn illustrations. Interface icons are Solar (480 Design,
CC BY 4.0) taken from the Iconify set by `scripts/build-icons.mjs`. No people
are shown.

## Content

Client words come from the CMS and only published ones appear on the site. The
local seed holds the four real quotes the owner sent (Balkan Bee, AS-MED, Leo
Malerbetrieb GmbH, Pixel Print), with the client's logo standing in for a
photo. Until a client's name is in, the company leads and the service sits
under it; with a name, the name leads over "Role, Company". The live site
reads them from its database, where they are entered in /admin. Unpublished
entries show on a development server only (marked "Draft").
