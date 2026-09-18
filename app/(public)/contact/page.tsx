import { getSiteSettings } from "@/lib/settings";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Get in Touch" title="Contact Us" />
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-5">
            {settings.address && (
              <p className="flex items-start gap-3 text-sm text-charcoal/80"><MapPin className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />{settings.address}</p>
            )}
            {settings.phone && (
              <p className="flex items-center gap-3 text-sm text-charcoal/80"><Phone className="h-5 w-5 text-gold-600 shrink-0" />{settings.phone}</p>
            )}
            {settings.email && (
              <p className="flex items-center gap-3 text-sm text-charcoal/80"><Mail className="h-5 w-5 text-gold-600 shrink-0" />{settings.email}</p>
            )}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-royal-700 font-semibold hover:text-gold-600">
                <MessageCircle className="h-5 w-5 shrink-0" /> Chat on WhatsApp
              </a>
            )}
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
