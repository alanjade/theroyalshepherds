"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/settings";

const inputClass = "w-full rounded-lg border border-royal-200 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium text-royal-900 mb-1";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const homepage = settings.homepage as Record<string, string>;
  const seo = settings.seo as Record<string, string>;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateSiteSettings(formData);
      setSaved(res.success);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-semibold text-royal-900">General</h2>
        <div><label className={labelClass}>Company Name</label><input name="company_name" defaultValue={settings.company_name} className={inputClass} /></div>
        <div><label className={labelClass}>Motto</label><input name="company_motto" defaultValue={settings.company_motto} className={inputClass} /></div>
        <div><label className={labelClass}>Description</label><textarea name="company_description" defaultValue={settings.company_description} rows={3} className={inputClass} /></div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-royal-900">Contact</h2>
        <div><label className={labelClass}>Address</label><input name="address" defaultValue={settings.address ?? ""} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={settings.phone ?? ""} className={inputClass} /></div>
          <div><label className={labelClass}>Email</label><input name="email" defaultValue={settings.email ?? ""} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>WhatsApp</label><input name="whatsapp" defaultValue={settings.whatsapp ?? ""} className={inputClass} /></div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-royal-900">Social</h2>
        {["facebook_url", "instagram_url", "youtube_url", "tiktok_url", "x_url"].map((f) => (
          <div key={f}><label className={labelClass}>{f.replace("_url", "").replace(/^\w/, (c) => c.toUpperCase())}</label>
            <input name={f} defaultValue={(settings as any)[f] ?? ""} className={inputClass} /></div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-royal-900">Homepage</h2>
        <div><label className={labelClass}>Hero Title</label><input name="hero_title" defaultValue={homepage.hero_title ?? ""} className={inputClass} /></div>
        <div><label className={labelClass}>Hero Subtitle</label><textarea name="hero_subtitle" defaultValue={homepage.hero_subtitle ?? ""} rows={2} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Primary CTA Label</label><input name="cta_primary" defaultValue={homepage.cta_primary ?? ""} className={inputClass} /></div>
          <div><label className={labelClass}>Secondary CTA Label</label><input name="cta_secondary" defaultValue={homepage.cta_secondary ?? ""} className={inputClass} /></div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-royal-900">SEO</h2>
        <div><label className={labelClass}>Site Title</label><input name="seo_title" defaultValue={seo.site_title ?? ""} className={inputClass} /></div>
        <div><label className={labelClass}>Meta Description</label><textarea name="seo_description" defaultValue={seo.meta_description ?? ""} rows={2} className={inputClass} /></div>
      </section>

      {saved && <p className="text-sm text-emerald-700">Settings saved.</p>}
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Settings"}</Button>
    </form>
  );
}
