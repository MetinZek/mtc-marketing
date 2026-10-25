// Full-resolution screenshots of the local site for visual review.
//   node snap.mjs <url> <out.png> [--w 1440] [--h 900] [--y 0] [--clip x,y,w,h]
//                 [--reduced] [--wait 2500] [--mobile] [--full]
// Pointer lock and pointer capture are stubbed in every page (approved-
// collection §7); input stays virtual.
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(name);

const CHROME =
  process.env.SCROLLCRAFT_CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--use-angle=default", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"],
});
const mobile = has("--mobile");
const context = await browser.newContext({
  viewport: { width: Number(opt("--w", mobile ? 390 : 1440)), height: Number(opt("--h", mobile ? 844 : 900)) },
  deviceScaleFactor: Number(opt("--dpr", 1)),
  reducedMotion: has("--reduced") ? "reduce" : "no-preference",
  hasTouch: mobile,
  isMobile: mobile,
});
await context.addInitScript(() => {
  Element.prototype.requestPointerLock = () => Promise.resolve();
  Element.prototype.setPointerCapture = () => {};
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle" });
const y = Number(opt("--y", 0));
if (y) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
}
await page.waitForTimeout(Number(opt("--wait", 2500)));
const click = opt("--click", null);
if (click) {
  await page.click(click);
  await page.waitForTimeout(900);
}
const clip = opt("--clip", null);
await page.screenshot({
  path: out,
  fullPage: has("--full"),
  ...(clip ? { clip: Object.fromEntries(["x", "y", "width", "height"].map((k, i) => [k, Number(clip.split(",")[i])])) } : {}),
});
if (errors.length) console.log("page errors:\n" + errors.join("\n"));
await browser.close();
console.log("saved", out);
