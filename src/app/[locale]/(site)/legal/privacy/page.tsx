import type { Metadata } from "next";
import {
  LegalDocument,
  LegalLink,
  LegalList,
  LegalSection,
  LEGAL_ENTITY_NAME,
} from "@/components/sections/LegalDocument";
import { contactDefaults } from "@/config/site";
import { withLocale } from "@/i18n/paths";
import { getLocale } from "@/i18n/get-locale";
import { buildMetadata } from "@/lib/seo";

const LAST_UPDATED = "September 13, 2026";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildMetadata({
    path: "/legal/privacy",
    title: `Privacy Policy — ${LEGAL_ENTITY_NAME}`,
    description: `How ${LEGAL_ENTITY_NAME} collects, uses, and protects information submitted through this website.`,
    locale,
  });
}

/**
 * /legal/privacy — static, English-only legal content (kept in one
 * canonical language across locales, like the rest of the legal set).
 * Every factual claim below (data collected, Resend, cookies, storage)
 * was checked against the actual codebase, not assumed.
 */
export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const cookiesHref = withLocale("/legal/cookies", locale);

  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={`This Privacy Policy explains how ${LEGAL_ENTITY_NAME} ("${LEGAL_ENTITY_NAME}", "we", "us", or "our") collects, uses, and protects information when you visit this website or submit an inquiry through it.`}
    >
      <LegalSection heading="1. Information we collect">
        <p>We collect information in two ways: information you choose to give us, and limited technical information collected automatically as part of operating the website.</p>
        <p className="font-medium text-ink">Information you provide directly</p>
        <p>When you submit our contact form, we collect the information you enter into it, which may include:</p>
        <LegalList
          items={[
            "Your name",
            "Your email address",
            "Your phone number, if provided",
            "Your company name, if provided",
            "The service you are enquiring about, if selected",
            "The content of your message",
          ]}
        />
        <p>All fields other than name, email, and message are optional, and you control what you share with us.</p>
        <p className="font-medium text-ink">Information collected automatically</p>
        <p>
          This website does not use analytics, advertising, or visitor-tracking technologies. Our
          hosting infrastructure may automatically record standard technical log data (such as IP
          address, browser type, and request timestamps) for security and operational purposes, as
          is standard for most websites. We do not use this information to individually identify or
          profile visitors.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <p>We use the information collected through the contact form to:</p>
        <LegalList
          items={[
            "Respond to your enquiry and communicate with you about your project",
            "Prepare proposals, quotes, or project information you have requested",
            "Maintain internal records of enquiries and client communication",
            "Operate, maintain, and improve this website",
            "Comply with applicable legal obligations",
          ]}
        />
        <p>
          We do not sell your personal information, and we do not use the details you submit to
          send you marketing communications unless you separately request or agree to that.
        </p>
      </LegalSection>

      <LegalSection heading="3. Email communication">
        <p>
          When you submit the contact form, a notification containing your submitted details is
          sent to {LEGAL_ENTITY_NAME}&rsquo;s inbox so that our team can respond to you. This
          notification email is delivered using Resend, a third-party transactional email service
          (see Section 5). We may reply to the email address you provided in order to continue the
          conversation about your enquiry.
        </p>
      </LegalSection>

      <LegalSection heading="4. Data storage and security">
        <p>
          Contact form submissions are stored securely within our internal systems and are
          accessible only to authorized {LEGAL_ENTITY_NAME} personnel through a password-protected
          administration panel. We apply reasonable technical and organizational measures to
          protect the information you share with us against unauthorized access, loss, or misuse.
        </p>
        <p>
          No method of electronic storage or transmission over the internet is completely secure,
          and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="5. Third-party services">
        <p>
          We use a limited number of third-party service providers to operate this website and
          respond to your enquiries. These providers process information solely on our behalf and
          for the purposes described below:
        </p>
        <LegalList
          items={[
            <span key="resend">
              <strong className="font-medium text-ink">Resend</strong> — used to deliver the email
              notification generated when you submit our contact form, and to allow us to reply to
              you. Resend processes the information contained in your submission (including your
              name, email address, and message) solely to transmit that email. You can review
              Resend&rsquo;s own privacy practices at{" "}
              <LegalLink href="https://resend.com">resend.com</LegalLink>.
            </span>,
          ]}
        />
        <p>
          We do not currently use analytics platforms, advertising networks, or other third-party
          tracking services on this website.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies and analytics">
        <p>
          This website does not use analytics or advertising cookies. It uses one strictly
          necessary cookie to support the password-protected administration panel used by our
          staff; this cookie is not set for ordinary visitors browsing the public website. For full
          details, see our{" "}
          <LegalLink href={cookiesHref}>Cookies Policy</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your rights">
        <p>
          Depending on the data protection laws that apply to you, you may have rights in relation
          to the personal information we hold about you, which can include the right to:
        </p>
        <LegalList
          items={[
            "Request access to the personal information we hold about you",
            "Request correction of inaccurate or incomplete information",
            "Request deletion of your personal information",
            "Object to or request that we restrict certain processing",
            "Request a copy of your information in a portable format",
          ]}
        />
        <p>
          To exercise any of these rights, contact us using the details in Section 9. We may need
          to verify your identity before responding to a request.
        </p>
      </LegalSection>

      <LegalSection heading="8. Data retention">
        <p>
          We retain contact form submissions for as long as reasonably necessary to respond to
          your enquiry, manage our client relationship, and maintain appropriate business records,
          or until you request that we delete your information, whichever comes first. Where we
          are no longer required to keep information for these purposes, we take reasonable steps
          to delete or anonymize it.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact us">
        <p>If you have questions about this Privacy Policy or wish to exercise any of your rights, contact us at:</p>
        <p>
          {LEGAL_ENTITY_NAME}
          <br />
          <LegalLink href={`mailto:${contactDefaults.email}`}>{contactDefaults.email}</LegalLink>
          <br />
          {contactDefaults.location}
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices
          or for legal, operational, or regulatory reasons. The &ldquo;Last updated&rdquo; date at
          the top of this page reflects the most recent revision. We encourage you to review this
          page periodically.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
