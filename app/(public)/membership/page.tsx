import { SectionHeader } from "@/components/ui/SectionHeader";
import { MembershipApplicationForm } from "@/components/forms/MembershipApplicationForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Membership" };

const FAQS = [
  { q: "Who can join?", a: "Young people connected to Christ Apostolic Church who are ready to grow in faith, leadership and service. [Update with your company's actual eligibility criteria.]" },
  { q: "What is the membership process?", a: "Submit the application below, meet with a company officer, and complete a short orientation before your membership number is issued." },
  { q: "What is expected of members?", a: "Regular attendance, participation in company activities, and living out the company's core values. [Update with your company's actual expectations.]" },
];

export default function MembershipPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-16">
        <SectionHeader eyebrow="Join Us" title="Membership"
          description="Become part of a community committed to faith, leadership and service." />

        <div className="grid sm:grid-cols-3 gap-8 text-center -mt-8">
          <div><h3 className="font-display font-bold text-royal-900">Why Join?</h3><p className="mt-2 text-sm text-charcoal/70">Grow in faith, leadership and lifelong friendships.</p></div>
          <div><h3 className="font-display font-bold text-royal-900">Who Can Join?</h3><p className="mt-2 text-sm text-charcoal/70">Young people ready to commit to our values and activities.</p></div>
          <div><h3 className="font-display font-bold text-royal-900">The Process</h3><p className="mt-2 text-sm text-charcoal/70">Apply below — an officer will follow up on next steps.</p></div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-royal-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="rounded-lg border border-royal-100 p-4">
                <summary className="font-semibold text-royal-900 cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-sm text-charcoal/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div id="apply">
          <h2 className="font-display text-2xl font-bold text-royal-900 mb-6">Membership Application</h2>
          <MembershipApplicationForm />
        </div>
      </div>
    </div>
  );
}
