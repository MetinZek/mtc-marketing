# BRIEF: MTC homepage redesign

**Self-authored under explicit creative delegation.** The owner asked for the
research, plan and build to run straight through ("Do the research, then
continue through implementation without stopping after the plan"). Their
written brief is quoted where it answers a question; everything else is an
authored decision and is labelled as one.

Evidence used: the live site (mtcmarketing.co, read 23 October 2026), the
existing Next.js project in this repo, the owner's written brief, and Mobbin
references (see `docs/redesign/design-direction.md`). No interview beyond the
written brief.

---

## The eight topics

1. **Vibe.** Owner: "premium, clean, colorful light-mode website that feels
   trustworthy and memorable." Authored references from other media: a cut
   ice cube catching studio light; Dieter Rams-era product photography on a
   white sweep; the colour of ice lollies against snow.
2. **Scroll journey (authored, from the owner's section list).** Hero, real
   work, what we do, how we work, proof, then a clear call to action.
   The owner allowed sections to be reorganised, removed or added.
3. **Energy curve (authored).** Bright and calm at the top, lively through the
   work, deliberately quiet for one beat, loudest at the services turn, then
   settling down through method and proof into a calm, decisive close.
4. **Feeling and the one moment.** See the feeling curve and peak below.
5. **The one thing no other site does (authored).** The ice cube from the
   hero comes back and turns a quarter per discipline under your scroll; the
   face that comes forward floods the stage with that discipline's colour.
6. **Distance from premium-minimal.** Owner: "premium, clean, colorful".
   Authored: playful-premium. Clean white ground and strict type, with colour
   that owns specific regions (the cube's light, the discipline faces, the real
   work) rather than confetti.
7. **One world or scenes?** Distinct scenes. An agency site has to let people
   jump (work, services, contact), so a continuous world is wrong here.
8. **Assets.** Owner: "Reuse the real work and assets shown on the website."
   Used: 67 project images, 4 cover videos, 7 client logos, 5 journal covers,
   the MTC logo. Nothing generated through kie.ai (owner: no external
   services). The ice cube is rendered in the browser with WebGL, from code.
   The owner mentioned an uploaded ice-cube screenshot; it did not arrive in
   the session, so the cube follows the written description.

---

## Grammar: Faceted showcase (new)

One physical object (the ice cube) anchors the page. It appears in the hero
and returns at the peak; the real work sits between its two appearances.

- **Navigation:** a floating pill with the real site index (Work, Services,
  Studio, Journal), language switch and one CTA. It is a working site nav,
  not a progress readout.
- **Hero:** the object in a lit still life beside one claim. No media under
  the type.
- **Sequence:** hero (planes) > work (lateral reel) > statement (quiet type) >
  four sides (pinned turn, the peak) > method (wipes) > proof (flow) >
  inquiry desk.
- **Close:** an inquiry desk. Real controls (discipline chips) whose
  selection is carried into the contact form.
- **Bans:** copy over footage or scrims of any kind; a full-bleed scrub video;
  more than one centred act; section counters and scroll cues; a hero line that
  fades in from nothing; counters or statistics (MTC has no verified figures).

Why the other seven lost:

| Grammar | Why not |
|---|---|
| Filmic one-shot | Visitors must jump to work, services and contact; a single arc forbids an index. |
| Chaptered editorial | MTC sells work and services, not long-form argument. |
| Live surface | Not a software product. |
| Continuous world | No real geography or physical journey to travel through. |
| Typographic poster | The work imagery is the strongest proof; banning media would hide it. |
| Gallery / catalog | Closest fit for the portfolio, but it forbids a hero claim and persuasive copy, which the brief asks for. |
| Split stage | There is no two-sided comparison to resolve. |
| Rhythmic cutlist | Built for energy brands; this brief asks for premium and trustworthy. |

## Signature move

**The four-sided cube.** A real-time ice cube (WebGL, physical transmission and
dispersion) holds four coloured cores, one per discipline. In the services act
the page holds while scroll turns the cube a quarter at a time; the core that
comes forward brightens, the others dim, and the stage ground takes that
discipline's tint. Page-local code reads the act's `--sc-p`; the engine is
untouched.

## The tell-someone sentence

> It's the site where an ice cube turns as you scroll and every side that comes
> round is one of the four things they do.

## Journey

1. Recognition: a clear claim and a clear object. This is a serious studio.
2. Proof: the real work, moving.
3. Pause: one sentence on why one team beats four vendors.
4. Turn: the four disciplines, one face at a time.
5. Method: what working together looks like.
6. Reassurance: who they've worked with and what they write about.
7. Commitment: pick what you need, start a project.

## Feeling curve

| Act | Feeling | Cause on screen |
|---|---|---|
| 1 Hero | Curiosity | A clear ice cube catches coloured light and leans toward the pointer; one confident line beside it. |
| 2 Work reel | Desire | Real projects slide past sideways, each one alive with its own cover film. |
| 3 Statement | Calm | Frost ground, one sentence assembling line by line, nothing else. (Authored silence.) |
| 4 Four sides | Wonder (PEAK) | The cube returns, holds, and turns a face per discipline while the stage floods with each colour. |
| 5 Method | Trust | Four plain steps wipe in, in order, along one line. |
| 6 Proof | Reassurance | Real client logos and recent writing, quiet and orderly. |
| 7 Inquiry desk | Resolve | The page stops asking and offers a choice; the selection travels with the visitor. |

## The peak

> "The ice cube from the top came back and turned as I scrolled, and each side
> lit the whole section up in a different colour for each thing they do."

Lives in act 4. It gets the only real-time render budget below the hero, the
quiet statement act in front of it, and the largest span on the page.

## Authored silence

Act 3 (statement) is intentionally sparse: one sentence on a frost ground with
nothing moving except the line reveal. It is not dead scroll.

## Score

| Beat | Device | Why this one |
|---|---|---|
| Hero | flow + `parallax` planes, bespoke pointer tilt on the cube | Depth from differential movement; the cube is the focal plane. |
| Work | `pan` | Lateral travel reads as range: several projects, side by side. |
| Statement | flow + `kinetic` lines | The quiet beat; type is the only thing moving. |
| Four sides | `pin` + bespoke cube turn from `--sc-p` + cues | The frame holds while the object turns. |
| Method | flow + `reveal` wipes | Each step is a change of state. |
| Proof | flow + `in` with stagger | Administrative content, kept short. |
| Close | flow + `in`, bespoke brief chips, `magnet` on the CTA | The page ends on an input that carries forward. |

Families used: parallax, pan, kinetic, pin, reveal, in, pointer (7). No family
twice in a row. Zero `scrub` acts (cover films play as ambient loops, not under
the wheel). Planned length about 12 viewport-heights across 7 acts, which sits
outside the 13.6 to 13.8 band.
