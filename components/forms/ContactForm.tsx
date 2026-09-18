"use client";

import { useState, useTransition } from "react";
import { submitContactMessage } from "@/app/actions/public";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitContactMessage(formData);
      setResult(res.success ? { success: true } : { success: false, error: res.error });
    });
  }

  if (result?.success) {
    return (
      <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-4 text-sm font-medium">
        Thank you — your message has been sent. We&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4" aria-label="Contact form">
      {/* Honeypot — hidden from real users, bots often fill every field */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off"
        className="absolute -left-[9999px]" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-royal-900 mb-1">Name *</label>
          <input id="name" name="name" required className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-royal-900 mb-1">Email *</label>
          <input id="email" name="email" type="email" required className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-royal-900 mb-1">Phone</label>
        <input id="phone" name="phone" className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-royal-900 mb-1">Subject</label>
        <input id="subject" name="subject" className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-royal-900 mb-1">Message *</label>
        <textarea id="message" name="message" rows={5} required className="w-full rounded-lg border border-royal-200 px-3 py-2 text-sm" />
      </div>
      {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
      <Button type="submit" disabled={isPending}>{isPending ? "Sending…" : "Send Message"}</Button>
    </form>
  );
}
