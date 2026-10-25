// Functional checks of the redesign's controls against a running server.
//   node interactions.mjs http://localhost:3000
// Pointer lock/capture are stubbed (approved-collection §7). The contact
// test submits once; the dev store writes it to .data/ (no email is sent
// without RESEND_API_KEY).
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: process.env.SCROLLCRAFT_CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const results = [];
const check = (name, ok, detail = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);

async function newPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return { page, errors };
}

// 1. Homepage inquiry desk carries chips into the CTA link.
{
  const { page, errors } = await newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const desk = page.locator("#start");
  await desk.scrollIntoViewIfNeeded();
  const chips = desk.locator("button[aria-pressed]");
  check("inquiry desk shows 4 discipline chips", (await chips.count()) === 4);
  await chips.nth(0).click();
  await chips.nth(2).click();
  const pressed = await desk.locator('button[aria-pressed="true"]').count();
  check("two chips toggle on", pressed === 2);
  const href = await desk.locator('a[href*="/contact"]').first().getAttribute("href");
  check("CTA carries the selection", href === "/contact?services=branding,social-marketing", href ?? "");
  check("no console errors on homepage", errors.length === 0, errors.slice(0, 2).join(" | "));
  await page.context().close();
}

// 2. Contact form: preselection, validation, success.
{
  const { page, errors } = await newPage();
  await page.goto(base + "/contact?services=branding,web-app", { waitUntil: "networkidle" });
  const pressed = await page.locator('form button[aria-pressed="true"]').allInnerTexts();
  check("contact preselects chips from the URL", pressed.length === 2, pressed.join(", "));
  await page.getByRole("button", { name: /send message/i }).click();
  const alerts = await page.locator('[role="alert"]').count();
  check("empty submit shows field errors", alerts >= 3, `${alerts} alerts`);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("name"));
  check("focus moves to the first invalid field", focused === "name", String(focused));
  await page.fill('input[name="name"]', "Verification Test");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('textarea[name="message"]', "Automated check of the redesigned contact form. Please ignore.");
  await page.getByRole("button", { name: /send message/i }).click();
  await page.waitForSelector('[role="status"]', { timeout: 15000 }).catch(() => {});
  const success = await page.locator('[role="status"]').count();
  check("valid submit shows the confirmation", success === 1);
  check("no console errors on contact", errors.length === 0, errors.slice(0, 2).join(" | "));
  await page.context().close();
}

// 3. Mobile menu: opens, traps page scroll, closes on Escape, returns focus.
{
  const { page } = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const toggle = page.locator('[aria-controls="mobile-menu"]');
  await toggle.click();
  await page.waitForTimeout(500);
  check("mobile menu opens", (await page.locator("#mobile-menu").count()) === 1);
  check("menu toggle reports expanded", (await toggle.getAttribute("aria-expanded")) === "true");
  const overflow = await page.evaluate(() => document.body.style.overflow);
  check("page scroll locked while open", overflow === "hidden");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  check("Escape closes the menu", (await page.locator("#mobile-menu").count()) === 0);
  const back = await page.evaluate(() => document.activeElement?.getAttribute("aria-controls"));
  check("focus returns to the toggle", back === "mobile-menu", String(back));
  await page.context().close();
}

// 4. Keyboard order at the top of the homepage.
{
  const { page } = await newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const order = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    order.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        return (el?.getAttribute("aria-label") || el?.textContent || el?.tagName || "").trim().slice(0, 28);
      }),
    );
  }
  check("tab order starts with skip link, logo, nav", /skip/i.test(order[0] ?? "") && /home/i.test(order[1] ?? ""), order.join(" > "));
  await page.context().close();
}

// 5. Language switch from the homepage lands on a real page (was /de/en).
{
  const { page } = await newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const hrefs = await page.locator('[role="group"] a[hreflang]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  check("language links are /, /de, /sv", ["/", "/de", "/sv"].every((h) => hrefs.includes(h)), hrefs.join(" "));
  await page.context().close();
}

await browser.close();
console.log(results.join("\n"));
