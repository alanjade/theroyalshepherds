import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-royal">
        <h1 className="font-display text-3xl font-bold text-royal-900">Privacy Policy</h1>
        <p className="text-charcoal/70">
          [Placeholder privacy policy — replace with your organization&apos;s actual policy before launch.]
          This site collects information you submit through forms (contact, membership applications, event
          registrations) to respond to your inquiries and administer our programmes. Member data such as
          date of birth, address, and guardian/emergency contact details is kept private and is never
          published publicly. Only administrators with appropriate permissions can access this information.
        </p>
      </div>
    </div>
  );
}
