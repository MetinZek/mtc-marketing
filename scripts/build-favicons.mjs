/**
 * Builds the site's icons from the MTC app icon (public/brand/mtc-icon.png,
 * the white M on blue), into src/app, where Next.js picks them up and
 * writes the <link> tags itself:
 *
 * - favicon.ico (16, 32 and 48 px) and icon.png (512 px), for browser tabs,
 *   bookmarks and search results: zoomed in a little (the centre TAB_CROP
 *   of the artwork, keeping its own placement of the M) so the M stays
 *   legible at tab size;
 * - apple-icon.png (180 px), for phone home screens, framed as delivered.
 *
 * Run: node scripts/build-favicons.mjs
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "public/brand/mtc-icon.png";
const OUT = "src/app";
/** Share of the artwork kept, centred, for the tab-size icons. */
const TAB_CROP = 0.8;
const ICO_SIZES = [16, 32, 48];

const { width, height } = await sharp(SOURCE).metadata();
const side = Math.min(width, height);
const crop = Math.round(side * TAB_CROP);
const inset = Math.round((side - crop) / 2);
// RGBA: an ICO's PNG images must carry alpha (Next.js refuses RGB ones).
const tab = (size) =>
  sharp(SOURCE)
    .extract({ left: inset, top: inset, width: crop, height: crop })
    .resize(size, size, { kernel: "lanczos3" })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

// favicon.ico: PNG images in an ICO container (one directory entry each).
const pngs = await Promise.all(ICO_SIZES.map(tab));
const head = Buffer.alloc(6 + 16 * pngs.length);
head.writeUInt16LE(0, 0); // reserved
head.writeUInt16LE(1, 2); // type: icon
head.writeUInt16LE(pngs.length, 4);
let at = head.length;
pngs.forEach((png, i) => {
  const entry = 6 + 16 * i;
  head.writeUInt8(ICO_SIZES[i], entry); // width
  head.writeUInt8(ICO_SIZES[i], entry + 1); // height
  head.writeUInt16LE(1, entry + 4); // colour planes
  head.writeUInt16LE(32, entry + 6); // bits per pixel
  head.writeUInt32LE(png.length, entry + 8);
  head.writeUInt32LE(at, entry + 12);
  at += png.length;
});
await writeFile(`${OUT}/favicon.ico`, Buffer.concat([head, ...pngs]));
await writeFile(`${OUT}/icon.png`, await tab(512));
await sharp(SOURCE).resize(180, 180, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(`${OUT}/apple-icon.png`);

console.log(`icons: favicon.ico (${ICO_SIZES.join(", ")} px), icon.png (512 px), apple-icon.png (180 px)`);
