"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard, Users, Star, Shield, Building2, Calendar, Newspaper,
  Images, ClipboardList, FileText, Mail, Settings, History, X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/officers", label: "Officers", icon: Star },
  { href: "/admin/ranks", label: "Ranks", icon: Shield },
  { href: "/admin/units", label: "Units", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/resources", label: "Resources", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const content = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href as any} onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-royal-900 text-white" : "text-charcoal/70 hover:bg-royal-50"
            )}>
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 border-r border-royal-100 bg-white sticky top-0 h-screen overflow-y-auto">
        {content}
      </aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-white h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-royal-100">
              <span className="font-display font-bold text-royal-900">Admin Menu</span>
              <button onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            {content}
          </div>
          <div className="flex-1 bg-black/40" onClick={onClose} />
        </div>
      )}
    </>
  );
}
