import type { Metadata } from "next";
import {
  LegalDocument,
  LegalLink,
  LegalList,
  LegalSection,
  LEGAL_ENTITY_NAME,
} from "@/components/sections/LegalDocument";
import { contactDefaults } from "@/config/site";
import { getLocale } from "@/i18n/get-locale";
import { buildMetadata } from "@/lib/seo";

const LAST_UPDATED = "September 13, 2026";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildMetadata({
    path: "/legal/terms",
    title: `Terms of Use — ${LEGAL_ENTITY_NAME}`,
    description: `The terms governing your use of the ${LEGAL_ENTITY_NAME} website.`,
    locale,
  });
}

/** /legal/terms — static, English-only legal content. */
export default function TermsOfUsePage() {
  return (
    <LegalDocument
      title="Terms of Use"
      lastUpdated={LAST_UPDATED}
      intro={`These Terms of Use ("Terms") govern your access to and use of this website, operated by ${LEGAL_ENTITY_NAME} ("${LEGAL_ENTITY_NAME}", "we", "us", or "our"). By using this website, you agree to these Terms.`}
    >
      <LegalSection heading="1. Website usage">
        <p>
          This website is provided to share information about {LEGAL_ENTITY_NAME}, our services,
          our work, and to allow prospective clients to get in touch with us. You may browse this
          website and submit enquiries through the contact form for these purposes.
        </p>
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Use this website for any unlawful purpose or in a way that violates these Terms",
            "Attempt to gain unauthorized access to any part of this website or its underlying systems",
            "Interfere with, disrupt, or place undue load on the website's infrastructure",
            "Copy, scrape, or extract content from this website by automated means without our consent",
            "Submit false, misleading, or malicious information through our contact form",
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. Intellectual property">
        <p>
          Unless otherwise indicated, all content on this website — including text, graphics,
          logos, layouts, visual design, case studies, and branding — is owned by or licensed to
          {" "}{LEGAL_ENTITY_NAME} and is protected by applicable copyright, trademark, and other
          intellectual property laws.
        </p>
        <p>
          You may view and print pages of this website for your own personal or internal business
          reference. You may not reproduce, republish, distribute, or create derivative works from
          any part of this website for commercial purposes without our prior written consent.
        </p>
      </LegalSection>

      <LegalSection heading="3. Website content">
        <p>
          The content on this website, including descriptions of our services, our approach, and
          our portfolio of past work, is provided for general informational purposes. Case studies
          and results shown reflect specific past projects; outcomes for any future engagement will
          depend on its own circumstances and are not guaranteed.
        </p>
        <p>
          We may update, change, or remove content on this website at any time without prior
          notice, and we do not guarantee that all content is complete, current, or error-free at
          all times.
        </p>
      </LegalSection>

      <LegalSection heading="4. Services and project information">
        <p>
          Descriptions of our services (including branding, web and app development, social media
          and marketing, and content) on this website are general and informational. They do not,
          by themselves, constitute a binding offer, quotation, or proposal.
        </p>
        <p>
          Any actual project engagement with {LEGAL_ENTITY_NAME} — including scope, pricing,
          timeline, and deliverables — will be governed by a separate proposal, quote, or
          agreement entered into directly between {LEGAL_ENTITY_NAME} and the client. Where the
          terms of such an agreement conflict with these Terms, the separate agreement will govern
          for that engagement.
        </p>
      </LegalSection>

      <LegalSection heading="5. User responsibilities">
        <p>When using this website, you agree to:</p>
        <LegalList
          items={[
            "Provide accurate and truthful information when contacting us",
            "Use the website only for lawful purposes",
            "Not misrepresent your identity or affiliation when submitting an enquiry",
          ]}
        />
      </LegalSection>

      <LegalSection heading="6. External links">
        <p>
          This website may contain links to third-party websites, such as our social media
          profiles or the websites of service providers we use. These links are provided for your
          convenience. We do not control, endorse, or take responsibility for the content, privacy
          practices, or availability of any third-party website, and you access them at your own
          risk.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          This website and its content are provided on an &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis, without warranties of any kind, to the fullest extent permitted
          by applicable law.
        </p>
        <p>
          To the fullest extent permitted by law, {LEGAL_ENTITY_NAME} shall not be liable for any
          indirect, incidental, special, or consequential damages arising out of, or in connection
          with, your access to or use of (or inability to access or use) this website.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to the website or these terms">
        <p>
          We may update, modify, or discontinue any part of this website, and may revise these
          Terms, at any time. Changes take effect once posted to this page, and the &ldquo;Last
          updated&rdquo; date above reflects the most recent revision. Your continued use of this
          website after changes are posted constitutes your acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Governing law and jurisdiction">
        <p>
          These Terms are governed by and construed in accordance with the laws of the Republic of
          Kosovo, without regard to its conflict of law principles. Any dispute arising out of, or
          relating to, these Terms or your use of this website shall be subject to the exclusive
          jurisdiction of the competent courts of the Republic of Kosovo.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contact us">
        <p>Questions about these Terms of Use can be sent to:</p>
        <p>
          {LEGAL_ENTITY_NAME}
          <br />
          <LegalLink href={`mailto:${contactDefaults.email}`}>{contactDefaults.email}</LegalLink>
          <br />
          {contactDefaults.location}
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
