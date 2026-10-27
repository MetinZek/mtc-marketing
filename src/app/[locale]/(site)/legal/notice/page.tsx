import type { Metadata } from "next";
import {
  LegalDocument,
  LegalLink,
  LegalList,
  LegalSection,
  LEGAL_ENTITY_NAME,
} from "@/components/sections/LegalDocument";
import { businessDetails, contactDefaults } from "@/config/site";
import { getLocale } from "@/i18n/get-locale";
import { buildMetadata } from "@/lib/seo";

const LAST_UPDATED = "October 27, 2026";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildMetadata({
    path: "/legal/notice",
    title: `Legal notice | ${LEGAL_ENTITY_NAME}`,
    description: `Who runs this website, and credits for the fonts, icons, and code it is built with.`,
    locale,
  });
}

/**
 * /legal/notice — the legal notice (imprint): the business details from
 * `businessDetails` in src/config/site.ts, each shown only once it is
 * filled in, then the credits and licences for what the site is built with
 * (the attribution Solar's CC BY licence asks for, and the MIT notice for
 * the Fluent emoji, which ships in public/media/emoji/LICENSE.txt).
 * Static, English-only legal content.
 */
export default function LegalNoticePage() {
  const details: [string, string][] = (
    [
      ["Business name", LEGAL_ENTITY_NAME],
      ["Legal form", businessDetails.legalForm],
      ["Address", businessDetails.address || contactDefaults.location],
      ["Registration number", businessDetails.registrationNumber],
      ["Fiscal number", businessDetails.fiscalNumber],
      ["VAT number", businessDetails.vatNumber],
      ["Represented by", businessDetails.representative],
    ] as [string, string][]
  ).filter(([, value]) => value);

  return (
    <LegalDocument
      title="Legal notice"
      lastUpdated={LAST_UPDATED}
      intro="Who runs this website, and the credits for the fonts, icons, and code it is built with."
    >
      <LegalSection heading="1. Who runs this website">
        <dl className="divide-y divide-line border-y border-line">
          {details.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
          <div className="grid gap-1 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-6">
            <dt className="text-ink-muted">Email</dt>
            <dd>
              <LegalLink href={`mailto:${contactDefaults.email}`}>{contactDefaults.email}</LegalLink>
            </dd>
          </div>
          <div className="grid gap-1 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-6">
            <dt className="text-ink-muted">Phone</dt>
            <dd>
              <LegalLink href={`tel:${contactDefaults.phone.replace(/\s+/g, "")}`}>{contactDefaults.phone}</LegalLink>
            </dd>
          </div>
        </dl>
      </LegalSection>

      <LegalSection heading="2. Content and links">
        <p>
          We take care that the content of this website is correct and up to date, but we cannot
          guarantee that it is always complete or free of errors. Links to other websites are
          provided for convenience; their owners are responsible for their content.
        </p>
      </LegalSection>

      <LegalSection heading="3. Client work and trademarks">
        <p>
          The projects on this website show work {LEGAL_ENTITY_NAME} did for its clients. Client
          names and logos are trademarks of their owners and appear here only to show that work.
        </p>
      </LegalSection>

      <LegalSection heading="4. Credits and licences">
        <p>This website is built with the work of others, used under their licences:</p>
        <LegalList
          items={[
            <span key="inter">
              <strong className="font-medium text-ink">Inter</strong> typeface by Rasmus Andersson,
              under the <LegalLink href="https://openfontlicense.org">SIL Open Font License 1.1</LegalLink>.
            </span>,
            <span key="solar">
              <strong className="font-medium text-ink">Solar</strong> icon set by 480 Design, under
              the{" "}
              <LegalLink href="https://creativecommons.org/licenses/by/4.0/">
                Creative Commons Attribution 4.0 licence
              </LegalLink>
              .
            </span>,
            <span key="fluent">
              <strong className="font-medium text-ink">Fluent Emoji</strong> by Microsoft, under the{" "}
              <LegalLink href="/media/emoji/LICENSE.txt">MIT License</LegalLink>, converted to
              WebP.
            </span>,
            <span key="code">
              <strong className="font-medium text-ink">Code libraries</strong>: Next.js, React,
              three.js, Lenis, Tailwind CSS, and Zod, under the MIT License, and GSAP, under the{" "}
              <LegalLink href="https://gsap.com/standard-license">GSAP Standard License</LegalLink>.
            </span>,
          ]}
        />
      </LegalSection>
    </LegalDocument>
  );
}
