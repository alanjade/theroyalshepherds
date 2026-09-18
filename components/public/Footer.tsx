import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Twitter, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const social = [
    { href: settings.facebook_url, icon: Facebook, label: "Facebook" },
    { href: settings.instagram_url, icon: Instagram, label: "Instagram" },
    { href: settings.youtube_url, icon: Youtube, label: "YouTube" },
    { href: settings.x_url, icon: Twitter, label: "X" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-royal-900 text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {settings.logo_url ? (
              <Image src={settings.logo_url} alt={settings.company_name} width={32} height={32} className="rounded-full" />
            ) : (
              <span className="h-8 w-8 rounded-full bg-gold text-royal-900 flex items-center justify-center text-xs font-bold">RS</span>
            )}
            <span className="font-display font-bold text-white">{settings.company_name}</span>
          </div>
          <p className="text-sm italic text-gold-200">{settings.company_motto}</p>
          <p className="text-sm mt-3 leading-relaxed">{settings.company_description}</p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/events" className="hover:text-white">Events</Link></li>
            <li><Link href="/news" className="hover:text-white">News</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Contact</h3>
          <ul className="space-y-2 text-sm">
            {settings.address && <li>{settings.address}</li>}
            {settings.phone && <li>{settings.phone}</li>}
            {settings.email && <li>{settings.email}</li>}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-sm">Connect</h3>
          <div className="flex gap-3">
            {social.map((s) => (
              <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                 className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-royal-900">
                <s.icon className="h-4 w-4" />
              </a>
            ))}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                 aria-label="WhatsApp" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-royal-900">
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/50">
          <p>&copy; {year} {settings.company_name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
