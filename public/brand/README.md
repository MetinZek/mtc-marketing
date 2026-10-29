# MTC brand assets

The files here are **placeholders**. Drop the official artwork in with the
**same filenames** and no code changes are needed.

| File | Use | Notes |
| --- | --- | --- |
| `mtc-logo.svg` | Navigation, primary brand touchpoints | Official **blue** logo, as delivered |
| `mtc-logo-mono.svg` | Footer, low-contrast contexts | Single colour; should use `fill="currentColor"` so it inherits text colour |
| `mtc-icon.png` | Source of the site icons (browser tab, bookmarks, phone home screens) | The white M on blue, 1024 px square. After replacing it, run `node scripts/build-favicons.mjs` to rebuild `src/app/favicon.ico`, `icon.png` and `apple-icon.png` |

## Logo rules (from the brief)

- Keep the logo in its **original blue** form.
- **No gradient** on the logo, ever.
- Do **not** distort, stretch, rotate, morph, or redesign it.
- Do **not** use it as a large decorative background shape.
- It is a brand asset used naturally in nav, footer, and brand touchpoints.

## Preferred format

SVG with a tight `viewBox` and no fixed `width`/`height` on the root
(so it scales cleanly). If only PNG is available, supply `@1x` and `@2x`
and update `src/components/ui/Logo.tsx` intrinsic dimensions.
