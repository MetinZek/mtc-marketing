"use server";

import { dictionaryFor } from "@/i18n/get-dictionary";
import { createSubmission } from "@/lib/cms/admin";
import { sendContactNotification } from "@/lib/email";

export type DataRequestResult = {
  ok: boolean;
  errors?: Record<string, string>;
};

/** What each request asks for, in the studio's own words (the admin is English). */
const REQUESTS: Record<string, string> = {
  access: "Send a copy of my data",
  correct: "Correct my data",
  delete: "Delete my data",
  object: "Stop using my data",
};

const DETAILS_MAX_LENGTH = 3000;

/**
 * A request about someone's personal data, from /legal/data-request. It is
 * saved as a contact message ("Privacy request: …" as its service line) so
 * it lands in /admin/contact with everything else, and the studio inbox is
 * emailed with a subject that says what it is. The law gives the studio one
 * month to answer; the message says so. Validated here; the form's checks
 * are a convenience.
 */
export async function submitDataRequestAction(input: {
  name: string;
  email: string;
  type: string;
  details: string;
  locale?: string;
}): Promise<DataRequestResult> {
  const dict = dictionaryFor(typeof input.locale === "string" ? input.locale : "en");
  const request = REQUESTS[input.type];
  if (!request) return { ok: false, errors: { type: dict.dataRequest.typeRequired } };

  const details = String(input.details ?? "").trim().slice(0, DETAILS_MAX_LENGTH);
  const result = await createSubmission({
    name: input.name,
    email: input.email,
    service: `Privacy request: ${request}`,
    message: [
      `Privacy request: ${request}.`,
      details || "No further details given.",
      "Sent from the “Your data” page. Reply within one month of today.",
    ].join("\n\n"),
  });

  if (!result.ok) {
    const cf = dict.contactForm;
    const errors: Record<string, string> = {};
    if (result.errors.name) errors.name = cf.nameRequired;
    if (result.errors.email) errors.email = cf.emailInvalid;
    if (!errors.name && !errors.email) errors.details = cf.sendFailure;
    return { ok: false, errors };
  }

  try {
    await sendContactNotification(result.submission, `Privacy request (${request}) from ${result.submission.name}`);
  } catch (error) {
    console.error("[data-request] failed to send notification email:", error);
  }

  return { ok: true };
}
