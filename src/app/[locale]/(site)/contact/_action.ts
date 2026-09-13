"use server";

import { dictionaryFor, type Dictionary } from "@/i18n/get-dictionary";
import { createSubmission } from "@/lib/cms/admin";
import { sendContactNotification } from "@/lib/email";

export type ContactActionResult = {
  ok: boolean;
  errors?: Record<string, string>;
};

/**
 * The server-side zod schema (src/content/schema.ts, shared with the
 * CMS/admin) carries its own fixed English validation messages — it's
 * the authoritative fallback if a visitor ever bypasses the client-side
 * checks in ContactForm.tsx (JS disabled, a missed edge case, ...). This
 * re-maps those English messages to the active locale's translated copy
 * without touching the shared schema. `email` is the only field with two
 * possible messages (required vs. invalid format); every other field has
 * exactly one.
 */
function translateFieldError(field: string, rawMessage: string, dict: Dictionary): string {
  const cf = dict.contactForm;
  switch (field) {
    case "name":
      return cf.nameRequired;
    case "email":
      return rawMessage === "Please enter your email." ? cf.emailRequired : cf.emailInvalid;
    case "phone":
      return cf.phoneInvalid;
    case "message":
      return cf.messageRequired;
    default:
      return rawMessage;
  }
}

/**
 * Persists a contact submission to the CMS store (visible only in
 * /admin/contact) and emails the studio inbox. Validation is
 * authoritative here — the client's checks are a convenience. The
 * submission being saved is what the visitor's success state reflects;
 * the notification email is a best-effort side effect. A delivery
 * failure there (bad/missing Resend config, a transient Resend error)
 * is not a problem with what the visitor typed, so it must never be
 * surfaced as a "message" field error — it's logged server-side instead,
 * and the submission stays visible in /admin/contact either way.
 * `locale` (sent by the client, since Server Actions can't read
 * next/root-params themselves) selects which dictionary translates any
 * server-side error message.
 */
export async function submitContactAction(
  input: Record<string, unknown> & { locale?: string },
): Promise<ContactActionResult> {
  const dict = dictionaryFor(typeof input.locale === "string" ? input.locale : "en");

  const result = await createSubmission(input);
  if (!result.ok) {
    const errors = Object.fromEntries(
      Object.entries(result.errors).map(([field, message]) => [
        field,
        translateFieldError(field, message, dict),
      ]),
    );
    return { ok: false, errors };
  }

  try {
    await sendContactNotification(result.submission);
  } catch (error) {
    console.error("[contact] failed to send notification email:", error);
  }

  return { ok: true };
}
