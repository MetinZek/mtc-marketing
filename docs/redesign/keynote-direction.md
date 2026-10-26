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

## Visual thesis

**Work, presented like product.** A quiet monochrome stage (white, Apple grey
`#f5f5f7` and one deep black chapter) where MTC's real projects are unveiled
one at a time, at scale. The only saturated colour is the work itself, the
logo's blue as the interface accent, and the four discipline colours where
the page plays: the stickers and the journal's hover line.

## Hero focal asset

The **headline itself**: "WE MAKE BRANDS / IMPOSSIBLE TO IGNORE." in Inter at
weight 900, fitted so its widest line spans the column (on phones the words
wrap and the longest word spans it). Each letter is its own box; with a mouse
or trackpad the letters near the pointer drop toward weight 200 and fill back
in as it moves on; on touch screens an invisible point drifts through the
text in a slow figure of eight instead. Four stickers sit on its corners:
"Made in Kosovo" (red to pink), a 3D eyes emoji (for "impossible to
ignore"), a 3D rocket (launches) and the four disciplines (blue to violet).
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
the pointer (or drifts on touch screens), and the journal's hover line runs
through all four. Errors use `#d70015`.

## Sequence (homepage)

1. **Opener**: pill, fitted headline with stickers, one line, two actions,
   then "Brands we've worked with" between hairlines over the seven real
   client logos on a slow loop. Fills the first screen.
2. **Showroom** (the peak): featured projects as very large tiles, alternating
   a black full-width tile and pairs on mist; each unveils as it arrives.
3. **Night chapter**: "How we work" as one large paragraph whose words light
   up as it scrolls through, the four stages set small beneath it; thin glass
   squares drift and turn behind it in a layer that holds still while the
   section passes. Then the four disciplines as ruled rows.
4. **Client words**: one quote at a time, set large, its words going from grey
   to ink; beside it a line that fills over eight seconds, arrows and the
   count. Only shows real, published quotes (see Content below).
5. **Journal**: "Notes from the studio." and the five newest notes as a ruled
   list; hover draws the four-colour line and fills the arrow.
6. **Sign-off** (site-wide footer): "LET'S TALK." in the hero's fitted
   capitals as the link to the brief (letters thinning near the pointer, the
   drift on phones), with a 3D speech bubble, a waving hand and "Open for new
   projects" around it; then email, phone and the studio's local time.

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
that stops as soon as every letter has settled; on touch screens the same
loop follows a slow drifting point, only while the text is on screen. **Lenis** is the sole smooth-scroll engine
(chosen over Locomotive Scroll: already in the stack, native scrolling for
sticky and touch, and Locomotive v5 is itself built on Lenis), driven from
GSAP's ticker and feeding ScrollTrigger. CSS handles hover, focus and tap
states, the sticker springs and the quote words. Under
`prefers-reduced-motion: reduce` there is no smooth scrolling, no scrubbing,
no pointer weights, no autoplay and no hidden start state: every section is
in its final state, and the glass squares are a still image.

## Three.js

Used once, for the glass squares (`src/components/sections/glass-scene.ts`):
twelve squares with small rounded corners (seven on phones), thin bevelled
slabs at different depths, one shared geometry and one small shader. It
treats them as clear glass in a small studio: the faces show its light bent
through them, split a little by colour, with a soft band of light that slides
across as each pane turns; the bevels and edges catch it brightly; the cast is
only faintly cool. Faces that pass behind the paragraph are held to a faint
sheen so white text stays readable over them. Scroll lifts and turns them, a pointer tilts the
group. It earns its place by giving the night chapter depth without adding
colour or competing with the work. three.js is fetched only as the section
comes near; the scene draws on GSAP's ticker only while the section is on
screen and the tab visible, caps the pixel ratio (1.5, 1.25 on phones), and
disposes everything on navigation. With reduced motion, without JavaScript,
without WebGL or after a lost context, a still of the same scene shows
instead (`public/media/glass/squares.webp`, rendered from the scene itself).

## Assets and provenance

All imagery is MTC's own: project stills and cover films (copied from the live
site into `public/media/` on the earlier redesign branch), the seven client
logos from the live site's client strip, and the MTC logo from `public/brand/`.
The glass still is a frame of the site's own WebGL scene. The four sticker
emojis are Microsoft's Fluent Emoji 3D (MIT licence, `public/media/emoji/`
with its LICENSE.txt), converted to small WebP files. No generated or stock
imagery, no drawn illustrations. Interface icons are Solar (480 Design,
CC BY 4.0) taken from the Iconify set by `scripts/build-icons.mjs`. No people
are shown.

## Content

Client words come from the CMS and only published ones appear on the site. The
local seed holds five **drafts** (one per client project, with the client's
logo standing in for a photo) whose quotes, names and roles are placeholders
written by MTC for the owner to replace with each client's real words. They
are unpublished, show on a development server only (marked "Draft"), and a
production build never reads them.
