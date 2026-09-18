"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  userName, role, children,
}: { userName: string; role: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-royal-50/30">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-royal-100">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 text-royal-900" onClick={() => setOpen(true)} aria-label="Open menu">
                <Menu />
              </button>
              <span className="font-display font-bold text-royal-900 hidden sm:inline">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-royal-900">{userName}</p>
                <p className="text-xs text-charcoal/50 capitalize">{role.replace("_", " ")}</p>
              </div>
              <button onClick={handleLogout} aria-label="Log out" className="p-2 rounded-lg hover:bg-royal-50 text-charcoal/70">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
