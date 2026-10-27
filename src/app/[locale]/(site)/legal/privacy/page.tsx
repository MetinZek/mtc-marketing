import type { Metadata } from "next";
import {
  LegalContact,
  LegalDocument,
  LegalLink,
  LegalList,
  LegalSection,
  LEGAL_ENTITY_NAME,
} from "@/components/sections/LegalDocument";
import { tracking } from "@/config/tracking";
import { withLocale } from "@/i18n/paths";
import { getLocale } from "@/i18n/get-locale";
import { buildMetadata } from "@/lib/seo";

const LAST_UPDATED = "October 27, 2026";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildMetadata({
    path: "/legal/privacy",
    title: `Privacy Policy | ${LEGAL_ENTITY_NAME}`,
    description: `How ${LEGAL_ENTITY_NAME} collects, uses, and protects information submitted through this website.`,
    locale,
  });
}

/**
 * /legal/privacy — static, English-only legal content (kept in one
 * canonical language across locales, like the rest of the legal set).
 * Every factual claim below (data collected, providers, cookies, storage)
 * was checked against the actual codebase, not assumed. Google Analytics
 * and the Meta Pixel are described only while they are set up
 * (src/config/tracking.ts), and they run only with consent.
 */
export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const cookiesHref = withLocale("/legal/cookies", locale);
  const dataRequestHref = withLocale("/legal/data-request", locale);
  const usesAnalytics = Boolean(tracking.googleAnalyticsId);
  const usesPixel = Boolean(tracking.metaPixelId);
  const usesTrackers = usesAnalytics || usesPixel;
  const measured = [
    usesAnalytics && "how you use the website (through Google Analytics)",
    usesPixel && "visits that come from our ads (through the Meta Pixel)",
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={`This Privacy Policy explains how ${LEGAL_ENTITY_NAME} ("${LEGAL_ENTITY_NAME}", "we", "us", or "our") collects, uses, and protects personal data when you visit this website, send us an enquiry, or ask us about your data.`}
    >
      <LegalSection heading="1. Who is responsible">
        <p>
          {LEGAL_ENTITY_NAME} is the controller of the personal data described in this policy. You
          can reach us at:
        </p>
        <LegalContact />
        <p>
          We handle personal data in line with Kosovo&rsquo;s Law No. 06/L-082 on the Protection
          of Personal Data and, where it applies to you, the EU General Data Protection Regulation
          (GDPR).
        </p>
      </LegalSection>

      <LegalSection heading="2. Information we collect">
        <p className="font-medium text-ink">When you contact us</p>
        <p>When you send our contact form, we collect what you enter into it:</p>
        <LegalList
          items={[
            "Your name",
            "Your email address",
            "Your phone number, if you give it",
            "Your company name, if you give it",
            "The services you are interested in, if you choose any",
            "The content of your message",
          ]}
        />
        <p>
          Only your name, email address, and message are required. Before sending, you also
          confirm that you are 16 or older and have read this policy. If you email or call us
          instead, we receive the details you share that way.
        </p>
        <p className="font-medium text-ink">When you ask about your data</p>
        <p>
          When you use our <LegalLink href={dataRequestHref}>data request form</LegalLink>, we
          collect your name, your email address, what you would like us to do, and any details you
          add.
        </p>
        <p className="font-medium text-ink">When you browse the website</p>
        <p>
          Like most websites, our hosting provider automatically records standard technical data
          for each request (such as your IP address, browser type, the page requested, and the
          time) to deliver the website and keep it secure. We do not use this data to identify or
          profile visitors.
        </p>
        {usesTrackers ? (
          <p>
            If you allow it in our cookie banner, we also collect information about {measured}. See
            Section 6.
          </p>
        ) : (
          <p>This website does not use analytics, advertising, or other visitor-tracking tools.</p>
        )}
      </LegalSection>

      <LegalSection heading="3. How we use it, and on what legal basis">
        <LegalList
          items={[
            <span key="reply">
              <strong className="font-medium text-ink">To answer your enquiry</strong> and to
              prepare proposals or quotes you ask for, because you asked us to take these steps
              before a possible contract (GDPR Article 6(1)(b)), and because we have a legitimate
              interest in replying to business enquiries (Article 6(1)(f)).
            </span>,
            <span key="records">
              <strong className="font-medium text-ink">To keep records of our conversations</strong>{" "}
              with clients and prospective clients, based on our legitimate interest in running our
              business (Article 6(1)(f)), and where tax or accounting law requires it (Article
              6(1)(c)).
            </span>,
            <span key="requests">
              <strong className="font-medium text-ink">To handle requests about your data</strong>,
              because the law requires us to (Article 6(1)(c)).
            </span>,
            <span key="security">
              <strong className="font-medium text-ink">To run the website and keep it secure</strong>,
              based on our legitimate interest in a working, safe website (Article 6(1)(f)).
            </span>,
            ...(usesTrackers
              ? [
                  <span key="consent">
                    <strong className="font-medium text-ink">
                      To measure visits{usesPixel ? " and our ads" : ""}
                    </strong>
                    , only with your consent (Article 6(1)(a)), which you can withdraw at any time
                    under &ldquo;Cookie settings&rdquo; at the bottom of every page.
                  </span>,
                ]
              : []),
          ]}
        />
        <p>
          We do not sell your personal data, we do not make decisions about you by automated
          means, and we do not send you marketing emails unless you ask us to.
        </p>
      </LegalSection>

      <LegalSection heading="4. Who we share it with">
        <p>
          We use a small number of service providers who process personal data on our behalf, only
          for the purposes below and under agreements that require them to protect it:
        </p>
        <LegalList
          items={[
            <span key="vercel">
              <strong className="font-medium text-ink">Vercel</strong>: hosts this website and
              processes the technical request data described in Section 2.
            </span>,
            <span key="supabase">
              <strong className="font-medium text-ink">Supabase</strong>: stores the messages and
              requests you send us, and the website&rsquo;s content and media, in its database and
              file storage.
            </span>,
            <span key="resend">
              <strong className="font-medium text-ink">Resend</strong>: delivers the email
              notification our team receives when you send the contact or data request form, which
              contains the details you entered.
            </span>,
            ...(usesAnalytics
              ? [
                  <span key="google">
                    <strong className="font-medium text-ink">Google</strong> (Google Ireland
                    Limited and Google LLC): provides Google Analytics, only if you allow
                    analytics cookies.
                  </span>,
                ]
              : []),
            ...(usesPixel
              ? [
                  <span key="meta">
                    <strong className="font-medium text-ink">Meta</strong> (Meta Platforms Ireland
                    Limited): provides the Meta Pixel, only if you allow marketing cookies. Meta
                    also uses this data for its own purposes, under{" "}
                    <LegalLink href="https://www.facebook.com/privacy/policy/">
                      Meta&rsquo;s Privacy Policy
                    </LegalLink>
                    .
                  </span>,
                ]
              : []),
          ]}
        />
        <p>
          We may also disclose personal data where the law requires it, for example to a court or
          public authority.
        </p>
      </LegalSection>

      <LegalSection heading="5. Transfers outside your country">
        <p>
          Some of these providers are based in, or use servers in, the United States and other
          countries outside Kosovo and the European Economic Area. Where personal data is
          transferred there, we rely on the safeguards each provider offers, such as the EU&ndash;US
          Data Privacy Framework or the European Commission&rsquo;s Standard Contractual Clauses.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies">
        {usesTrackers ? (
          <p>
            We use one necessary cookie to remember your cookie choice, and{" "}
            {usesAnalytics && usesPixel
              ? "analytics and marketing cookies"
              : usesAnalytics
                ? "analytics cookies"
                : "marketing cookies"}{" "}
            only if you allow them. Nothing optional is set before you choose, and you can change
            your choice at any time under &ldquo;Cookie settings&rdquo; at the bottom of every page.
            For the full list, see our <LegalLink href={cookiesHref}>Cookie Policy</LegalLink>.
          </p>
        ) : (
          <p>
            This website does not use analytics or advertising cookies. It uses one strictly
            necessary cookie to support the password-protected administration panel used by our
            staff; this cookie is not set for ordinary visitors. For full details, see our{" "}
            <LegalLink href={cookiesHref}>Cookie Policy</LegalLink>.
          </p>
        )}
      </LegalSection>

      <LegalSection heading="7. How long we keep it">
        <LegalList
          items={[
            "Enquiries that do not lead to a project: deleted within two years of our last exchange.",
            "Enquiries that lead to a project: kept for as long as we work together, and afterwards for as long as tax and accounting law requires.",
            "Requests about your data: a record of the request and our answer, kept for up to three years to show how we handled it.",
            "Technical request data: kept by our hosting provider for a short period for security and troubleshooting.",
            ...(usesAnalytics ? ["Google Analytics data: kept for at most 14 months."] : []),
          ]}
        />
        <p>You can ask us to delete your data sooner; see Section 9.</p>
      </LegalSection>

      <LegalSection heading="8. Children">
        <p>
          This website is meant for businesses and adults. We do not knowingly collect personal
          data from anyone under 16, and our contact form asks you to confirm that you are 16 or
          older. If you believe a child has sent us their details, please contact us and we will
          delete them.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your rights">
        <p>Depending on the law that applies to you, you have the right to:</p>
        <LegalList
          items={[
            "Ask for a copy of the personal data we hold about you",
            "Have inaccurate or incomplete data corrected",
            "Have your data deleted",
            "Restrict or object to how we use your data",
            "Receive your data in a portable format",
            ...(usesTrackers ? ["Withdraw your consent at any time, without affecting what happened before"] : []),
          ]}
        />
        <p>
          To use any of these rights, send us a request through our{" "}
          <LegalLink href={dataRequestHref}>data request form</LegalLink> or email us at the
          address in Section 1. We reply within one month. To protect your data, we may ask you to
          confirm your identity first.
        </p>
        <p>
          You also have the right to complain to a data protection authority: in Kosovo, the
          Information and Privacy Agency (Agjencia për Informim dhe Privatësi); in the EU or EEA,
          the authority where you live, work, or think your rights were infringed. We would
          appreciate the chance to resolve your concern first.
        </p>
      </LegalSection>

      <LegalSection heading="10. Security">
        <p>
          Messages and requests you send us are stored with our providers and are accessible only
          to authorised {LEGAL_ENTITY_NAME} staff through a password-protected administration
          panel. We apply reasonable technical and organisational measures to protect personal
          data against unauthorised access, loss, or misuse. No method of storage or transmission
          over the internet is completely secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices
          or for legal, operational, or regulatory reasons. The &ldquo;Last updated&rdquo; date at
          the top of this page reflects the most recent revision.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
