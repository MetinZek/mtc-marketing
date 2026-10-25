# Scroll Craft engine (vendored)

`scrollcraft.js` and `scrollcraft.css` are verbatim copies of the Scroll Craft
plugin engine (nateherk-design, release 0.3.1). **Do not edit them.** The
engine is the mechanism; the site themes it through tokens and drives it with
`data-sc-*` attributes in its own markup.

- `scrollcraft.css` is pulled into the public site through
  `src/app/[locale]/scrollcraft.css`, inside the `scrollcraft` cascade layer
  (declared in `src/app/globals.css` between `base` and `components`), so
  Tailwind utilities still win over the engine's base rules.
- `scrollcraft.js` is loaded client-side only, by
  `src/components/motion/ScrollCraftRoot.tsx`, which mounts the engine on each
  page's content and calls `destroy()` on route change.
- Site-specific behaviour (the turning ice cube, the brief chips, keyboard
  handling inside pinned acts) lives in page code and reads the engine's
  published `--sc-p`, never inside these files.

To update: copy the two files from the plugin's `engine/` folder unchanged.
