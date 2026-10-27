import type { Metadata } from "next";
import {
  LegalContact,
  LegalDocument,
  LegalList,
  LegalSection,
  LEGAL_ENTITY_NAME,
} from "@/components/sections/LegalDocument";
import { getLocale } from "@/i18n/get-locale";
import { buildMetadata } from "@/lib/seo";

const LAST_UPDATED = "October 27, 2026";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildMetadata({
    path: "/legal/refunds",
    title: `Refund Policy | ${LEGAL_ENTITY_NAME}`,
    description: `How payments, cancellations, and refunds work for projects with ${LEGAL_ENTITY_NAME}.`,
    locale,
  });
}

/**
 * /legal/refunds — static, English-only legal content. Nothing is sold
 * through the website: every project is agreed in writing first, and that
 * agreement governs payment and refunds. This page sets the defaults the
 * agreements follow.
 */
export default function RefundPolicyPage() {
  return (
    <LegalDocument
      title="Refund Policy"
      lastUpdated={LAST_UPDATED}
      intro={`${LEGAL_ENTITY_NAME} makes custom work for each client: brands, websites, social media, and content. This policy explains how payments, cancellations, and refunds work. The written agreement for your project always comes first; where it says something different, the agreement applies.`}
    >
      <LegalSection heading="1. Payments are agreed before work starts">
        <p>
          Nothing is sold or charged through this website. Before any work begins, we agree the
          scope, the price, and the payment schedule with you in writing, in a proposal, quote, or
          contract. The agreement sets out when each payment is due, for example a deposit before
          work begins and the rest at agreed milestones or on delivery. There are no costs beyond
          those in the agreement, unless you approve them in writing first.
        </p>
      </LegalSection>

      <LegalSection heading="2. Delivered work">
        <p>
          Because our work is made to order for you, work that has been delivered is not
          refundable. If something we delivered does not match what we agreed, tell us, and we
          will put it right as set out in your agreement.
        </p>
      </LegalSection>

      <LegalSection heading="3. Cancelling a project">
        <p>You can cancel a project at any time by telling us in writing. In that case:</p>
        <LegalList
          items={[
            "You pay for the work done up to the date you cancel.",
            "You pay for costs we have already committed to on your behalf, such as licences or stock imagery you approved.",
            "If you have paid in advance for work we have not started, we refund that part.",
          ]}
        />
        <p>Your agreement may set out further details, such as notice periods or milestone fees.</p>
      </LegalSection>

      <LegalSection heading="4. Costs paid to others">
        <p>
          Fees paid to other companies for your project, such as domain names, hosting, software
          licences, stock imagery, printing, or advertising spend on platforms like Meta or Google,
          follow those companies&rsquo; own refund rules. Where a refund is possible, we will help
          you ask for it.
        </p>
      </LegalSection>

      <LegalSection heading="5. How refunds are paid">
        <p>
          We pay agreed refunds promptly, by the same method you used to pay, unless we agree a
          different method with you.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your legal rights">
        <p>
          Nothing in this policy limits the rights you have under the law, for example as a
          consumer.
        </p>
      </LegalSection>

      <LegalSection heading="7. Contact us">
        <p>Questions about payments or refunds can be sent to:</p>
        <LegalContact />
      </LegalSection>
    </LegalDocument>
  );
}
