import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-royal">
        <h1 className="font-display text-3xl font-bold text-royal-900">Terms of Use</h1>
        <p className="text-charcoal/70">
          [Placeholder terms of use — replace with your organization&apos;s actual terms before launch.]
          By using this website you agree to use it respectfully and in accordance with applicable law.
        </p>
      </div>
    </div>
  );
}
