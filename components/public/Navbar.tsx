"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/settings";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/membership", label: "Membership" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-royal-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 min-w-0 font-display font-bold text-royal-900">
            {settings.logo_url ? (
              <Image src={settings.logo_url} alt={settings.company_name} width={36} height={36} className="rounded-full shrink-0" />
            ) : (
              <span className="h-9 w-9 rounded-full bg-royal-900 text-gold flex items-center justify-center text-sm font-bold shrink-0">RS</span>
            )}
            <span className="truncate">{settings.company_name}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-charcoal/80 hover:text-royal-900">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button href="/membership" size="sm">Join Us</Button>
          </div>

          <button
            className="lg:hidden p-2 text-royal-900"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-royal-100 bg-white">
          <nav className="flex flex-col p-4 gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-charcoal/80 hover:bg-royal-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Button href="/membership" className="w-full">Join Us</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
