import "server-only";

/**
 * Email abstraction. No provider is wired up yet — swap the implementation
 * of `sendEmail` for Resend/Postmark/SES/etc. Every call site in the app
 * goes through this function, so plugging in a provider later touches one
 * file only.
 */
export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    console.warn("[email] No EMAIL_PROVIDER_API_KEY configured — skipping send:", payload.subject, "->", payload.to);
    return;
  }
  // TODO: wire up real provider here, e.g.:
  // await fetch("https://api.resend.com/emails", { ... })
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
