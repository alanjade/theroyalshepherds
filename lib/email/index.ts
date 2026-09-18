import "server-only";

/**
 * Email abstraction backed by Resend (https://resend.com). Every call site
 * in the app goes through `sendEmail`, so swapping providers later only
 * touches this file.
 *
 * Setup:
 *   1. Create a Resend account and verify a sending domain (or use their
 *      shared test domain while developing).
 *   2. Create an API key and set EMAIL_PROVIDER_API_KEY in your env.
 *   3. Set EMAIL_FROM_ADDRESS to a verified sender, e.g.
 *      "The Royal Shepherds <no-reply@yourdomain.org>".
 */
export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS;

  if (!apiKey || !from) {
    console.warn(
      "[email] EMAIL_PROVIDER_API_KEY or EMAIL_FROM_ADDRESS not configured — skipping send:",
      payload.subject, "->", payload.to
    );
    return;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      // Never throw from here — a failed notification email should not
      // fail the underlying action (application submitted, event
      // registration, etc). Log for now; wire into audit_logs or an
      // error tracker if you want visibility on delivery failures.
      const body = await res.text().catch(() => "");
      console.error("[email] Resend send failed:", res.status, body);
    }
  } catch (err) {
    console.error("[email] Resend request error:", err);
  }
}

export const templates = {
  applicationReceived: (name: string) => ({
    subject: "We received your membership application",
    html: `<p>Dear ${name},</p><p>Thank you for applying to join The Royal Shepherds. We'll review your application and be in touch soon.</p>`,
  }),
  applicationApproved: (name: string, membershipNumber: string) => ({
    subject: "Your membership application was approved",
    html: `<p>Dear ${name},</p><p>Congratulations! Your membership number is <strong>${membershipNumber}</strong>.</p>`,
  }),
  eventRegistrationConfirmed: (name: string, eventTitle: string) => ({
    subject: `Registration confirmed: ${eventTitle}`,
    html: `<p>Dear ${name},</p><p>Your registration for <strong>${eventTitle}</strong> is confirmed.</p>`,
  }),
};
