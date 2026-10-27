import type { Metadata } from "next";
import {
  LegalContact,
  LegalDocument,
  LegalLink,
  LegalSection,
  LEGAL_ENTITY_NAME,
} from "@/components/sections/LegalDocument";
import { consentCategories, tracking } from "@/config/tracking";
import { withLocale } from "@/i18n/paths";
import { getLocale } from "@/i18n/get-locale";
import { buildMetadata } from "@/lib/seo";

const LAST_UPDATED = "October 27, 2026";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildMetadata({
    path: "/legal/cookies",
    title: `Cookie Policy | ${LEGAL_ENTITY_NAME}`,
    description: `What cookies this website uses and why.`,
    locale,
  });
}

type CookieRow = { name: string; kind: string; purpose: string; lifetime: string; setBy: string };

/**
 * /legal/cookies — lists exactly the cookies this build can set: the
 * consent cookie (`mtc_consent`, src/lib/consent.ts) whenever there is a
 * choice to make, the staff-only admin session (`mtc_admin_session`,
 * src/lib/admin/auth.ts), and Google Analytics and Meta Pixel cookies only
 * while those tools are set up (src/config/tracking.ts), which then run
 * only with consent. Update this page if that ever changes.
 */
export default async function CookiesPolicyPage() {
  const locale = await getLocale();
  const privacyHref = withLocale("/legal/privacy", locale);
  const asksConsent = consentCategories.length > 0;
  const usesAnalytics = Boolean(tracking.googleAnalyticsId);
  const usesPixel = Boolean(tracking.metaPixelId);

  const rows: CookieRow[] = [
    ...(asksConsent
      ? [
          {
            name: "mtc_consent",
            kind: "Necessary",
            purpose: "Remembers your cookie choice, so we don’t ask again on every page.",
            lifetime: "6 months",
            setBy: LEGAL_ENTITY_NAME,
          },
        ]
      : []),
    {
      name: "mtc_admin_session",
      kind: "Necessary",
      purpose:
        "Keeps our staff signed in to the password-protected administration panel. It is only set when someone signs in there, never for visitors browsing the website.",
      lifetime: "12 hours",
      setBy: LEGAL_ENTITY_NAME,
    },
    ...(usesAnalytics
      ? [
          {
            name: "_ga",
            kind: "Analytics",
            purpose: "Tells visitors apart for Google Analytics, so visits can be counted.",
            lifetime: "2 years",
            setBy: "Google",
          },
          {
            name: `_ga_${tracking.googleAnalyticsId.slice(2)}`,
            kind: "Analytics",
            purpose: "Keeps track of the current visit for Google Analytics.",
            lifetime: "2 years",
            setBy: "Google",
          },
        ]
      : []),
    ...(usesPixel
      ? [
          {
            name: "_fbp",
            kind: "Marketing",
            purpose: "Recognises your browser for the Meta Pixel, so Meta can measure and report on our ads.",
            lifetime: "3 months",
            setBy: "Meta",
          },
        ]
      : []),
  ];

  return (
    <LegalDocument
      title="Cookie Policy"
      lastUpdated={LAST_UPDATED}
      intro={`This Cookie Policy explains what cookies are and which cookies ${LEGAL_ENTITY_NAME} uses on this website.`}
    >
      <LegalSection heading="1. What cookies are">
        <p>
          Cookies are small text files placed on your device by a website you visit. They can be
          used to make a website work, remember your choices, or recognise you across visits.
        </p>
      </LegalSection>

      <LegalSection heading="2. Cookies we use">
        <ul className="divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={row.name} className="py-5">
              <p className="break-all font-mono text-[0.9375rem] font-medium text-ink">{row.name}</p>
              <p className="mt-1.5">{row.purpose}</p>
              <dl className="mt-3 grid grid-cols-3 gap-4 text-meta">
                <div>
                  <dt className="text-ink-muted">Kind</dt>
                  <dd className="mt-0.5 font-medium text-ink">{row.kind}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Lasts</dt>
                  <dd className="mt-0.5 font-medium text-ink">{row.lifetime}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Set by</dt>
                  <dd className="mt-0.5 font-medium text-ink">{row.setBy}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection heading="3. Your choice">
        {asksConsent ? (
          <>
            <p>
              Necessary cookies are needed for the website to work and are always on. Analytics
              and marketing cookies are only set if you allow them in our cookie banner; nothing
              optional is set before you choose. &ldquo;Reject all&rdquo; is as easy as
              &ldquo;Accept all&rdquo;, and you can also choose one kind at a time.
            </p>
            <p>
              You can change or withdraw your choice at any time under &ldquo;Cookie
              settings&rdquo; at the bottom of every page. When you withdraw it, we delete the
              cookies these tools set on our domain and reload the page without them.
            </p>
          </>
        ) : (
          <p>
            This website does not use analytics cookies, advertising cookies, or any other
            non-essential tracking technology, so there is nothing to choose. Should this change,
            we will update this policy and ask for your consent before setting any such cookies.
          </p>
        )}
      </LegalSection>

      <LegalSection heading="4. Third parties">
        <p>
          We use Resend to deliver the email notifications generated by our forms (see our{" "}
          <LegalLink href={privacyHref}>Privacy Policy</LegalLink>). This happens on our server
          when you send a form and does not set any cookie in your browser.
        </p>
        {usesPixel && (
          <p>
            If you allow marketing cookies and are signed in to Facebook or Instagram in the same
            browser, Meta may also read its own cookies on its domains, under{" "}
            <LegalLink href="https://www.facebook.com/privacy/policies/cookies/">
              Meta&rsquo;s Cookie Policy
            </LegalLink>
            .
          </p>
        )}
        {!asksConsent && (
          <p>
            This website does not otherwise embed third-party scripts, widgets, or ads that would
            set third-party cookies.
          </p>
        )}
      </LegalSection>

      <LegalSection heading="5. Controlling cookies in your browser">
        <p>
          Most browsers let you view, block, and delete cookies in their settings. Blocking the
          necessary cookies may stop parts of the website from working as intended (for example,
          your cookie choice will not be remembered).
        </p>
      </LegalSection>

      <LegalSection heading="6. Changes to this policy">
        <p>
          We may update this Cookie Policy if the cookies or technologies used on this website
          change. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most
          recent revision.
        </p>
      </LegalSection>

      <LegalSection heading="7. Contact us">
        <p>Questions about this Cookie Policy can be sent to:</p>
        <LegalContact />
      </LegalSection>
    </LegalDocument>
  );
}
