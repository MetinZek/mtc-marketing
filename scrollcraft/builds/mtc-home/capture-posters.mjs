// Renders the ice-cube poster stills from the live WebGL scene (dev server),
// so the no-WebGL / save-data / first-paint fallback is the same object.
//   node capture-posters.mjs http://localhost:3000 ../../../public/media/ice
import { chromium } from "playwright-core";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [base = "http://localhost:3000", outDir = "../../../public/media/ice"] = process.argv.slice(2);
const require = createRequire(path.resolve("../../../package.json"));
const sharp = require("sharp");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.SCROLLCRAFT_CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__mtcIceCapture?.hero && window.__mtcIceCapture?.facets, null, {
  timeout: 30000,
});

const TINTS = ["#FFF5E0", "#EAF0FF", "#FFECED", "#E5F8F0"];
const shots = [
  {
    file: "hero.webp",
    key: "hero",
    frame: { yaw: -0.55, pitch: 0, lift: 0, weights: [0.7, 0.8, 0.7, 0.6], ground: "#ffffff" },
  },
  ...TINTS.map((ground, i) => ({
    file: `facet-${i}.webp`,
    key: "facets",
    frame: {
      yaw: -i * (Math.PI / 2) + 0.5,
      pitch: 0,
      lift: 0,
      weights: [0, 1, 2, 3].map((k) => (k === i ? 1 : 0.05)),
      ground,
    },
  })),
];

for (const shot of shots) {
  const dataUrl = await page.evaluate(
    ({ key, frame }) => window.__mtcIceCapture[key](frame),
    { key: shot.key, frame: shot.frame },
  );
  const buffer = Buffer.from(dataUrl.split(",")[1], "base64");
  const out = path.join(outDir, shot.file);
  await sharp(buffer).resize(1200, 1200, { fit: "cover" }).webp({ quality: 86 }).toFile(out);
  const meta = await sharp(out).metadata();
  console.log("saved", out, `${meta.width}x${meta.height}`);
}

await browser.close();
