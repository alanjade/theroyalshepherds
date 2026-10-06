"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { hasRole, type Role } from "@/lib/auth/roles";
import {
  LayoutDashboard, Users, Star, Shield, Building2, Calendar, Newspaper,
  Images, ClipboardList, FileText, Mail, Settings, History, KeyRound, X,
} from "lucide-react";

const NAV = [
  { minRole: "officer" as Role, href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { minRole: "admin" as Role, href: "/admin/members", label: "Members", icon: Users },
  { minRole: "admin" as Role, href: "/admin/officers", label: "Officers", icon: Star },
  { minRole: "admin" as Role, href: "/admin/ranks", label: "Ranks", icon: Shield },
  { minRole: "admin" as Role, href: "/admin/units", label: "Units", icon: Building2 },
  { minRole: "editor" as Role, href: "/admin/events", label: "Events", icon: Calendar },
  { minRole: "editor" as Role, href: "/admin/news", label: "News", icon: Newspaper },
  { minRole: "editor" as Role, href: "/admin/gallery", label: "Gallery", icon: Images },
  { minRole: "admin" as Role, href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { minRole: "editor" as Role, href: "/admin/resources", label: "Resources", icon: FileText },
  { minRole: "officer" as Role, href: "/admin/messages", label: "Messages", icon: Mail },
  { minRole: "super_admin" as Role, href: "/admin/users", label: "Admin Access", icon: KeyRound },
  { minRole: "admin" as Role, href: "/admin/settings", label: "Settings", icon: Settings },
  { minRole: "admin" as Role, href: "/admin/audit-logs", label: "Audit Logs", icon: History },
];

export function AdminSidebar({ open, onClose, role }: { open: boolean; onClose: () => void; role: string }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => hasRole(role, item.minRole));

  const content = (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => {
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
