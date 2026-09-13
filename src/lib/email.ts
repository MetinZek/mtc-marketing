import "server-only";

import { Resend } from "resend";
import { contactDefaults } from "@/config/site";
import type { Submission } from "@/content/types";

/**
 * Notifies the studio inbox of a new contact submission. Throws on any
 * failure (missing config, Resend error) — the caller decides how that
 * surfaces to the visitor. Never logs or exposes the API key.
 */
export async function sendContactNotification(
  submission: Submission,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from = process.env.CONTACT_FROM_EMAIL;
  if (!from) {
    throw new Error("CONTACT_FROM_EMAIL is not configured.");
  }

  const resend = new Resend(apiKey);

  const fields: [string, string][] = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Company", submission.company || "—"],
    ["Phone", submission.phone || "—"],
    ["Service", submission.service || "—"],
  ];

  const submittedAt = formatSubmittedAt(submission.submittedAt);

  const text = [
    "New Contact Form Submission",
    "",
    ...fields.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    submission.message,
    "",
    `Submitted: ${submittedAt}`,
  ].join("\n");

  const html = renderHtml(fields, submission.message, submittedAt);

  const { error } = await resend.emails.send({
    from,
    to: contactDefaults.email,
    replyTo: submission.email,
    subject: `New contact form submission from ${submission.name}`,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send the email.");
  }
}

function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toLocaleString("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(
  fields: [string, string][],
  message: string,
  submittedAt: string,
): string {
  const rows = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 16px 6px 0;color:#666;font-size:14px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;color:#111;font-size:14px;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;color:#111;">
      <h2 style="margin:0 0 20px;font-size:18px;">New Contact Form Submission</h2>
      <table style="border-collapse:collapse;">${rows}</table>
      <div style="margin-top:20px;">
        <div style="color:#666;font-size:14px;margin-bottom:6px;">Message</div>
        <p style="margin:0;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#999;">Submitted: ${escapeHtml(submittedAt)}</p>
    </div>
  `.trim();
}
