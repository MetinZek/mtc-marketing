import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { SplitWords } from "@/components/motion/SplitWords";
import { DataRequestForm } from "@/components/sections/DataRequestForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { getSiteSettings } from "@/lib/cms/localized";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return buildMetadata({
    path: "/legal/data-request",
    title: dict.dataRequest.metaTitle,
    description: dict.dataRequest.metaDescription,
    locale,
  });
}

/**
 * /legal/data-request ("Your data"): where anyone can ask for a copy of
 * their personal data, or for it to be corrected, deleted, or no longer
 * used. Unlike the rest of the legal set it is translated, as it is a form.
 * Requests land in /admin/contact, where a message can be deleted for good.
 */
export default async function DataRequestPage() {
  const [dict, settings] = await Promise.all([getDictionary(), getSiteSettings()]);
  const dr = dict.dataRequest;

  return (
    <section aria-labelledby="data-request-title" className="pb-24 pt-6 sm:pb-32 sm:pt-10">
      <div className="container-mtc">
        <Reveal as="p" variant="fade" className="text-eyebrow text-ink-muted">
          {dr.eyebrow}
        </Reveal>
        <SplitWords as="h1" id="data-request-title" text={dr.title} className="text-display-1 mt-3 text-ink" />
        <Reveal as="p" delay={0.12} className="mt-6 max-w-2xl text-lead text-ink-muted sm:mt-8">
          {dr.intro}
        </Reveal>

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <Reveal className="rounded-[28px] bg-mist p-5 sm:rounded-[36px] sm:p-10 lg:col-span-8 lg:p-12">
            <DataRequestForm dict={dict} />
          </Reveal>
          <Reveal delay={0.08} className="space-y-6 text-[0.9375rem] leading-[1.5] text-ink-muted lg:col-span-4">
            <p>{dr.verifyNote}</p>
            <p>
              {dr.orEmail}{" "}
              <a
                href={`mailto:${settings.email}`}
                className="rounded-xs font-medium text-ink underline decoration-ink/30 underline-offset-2 transition-colors hover:decoration-ink"
              >
                {settings.email}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
