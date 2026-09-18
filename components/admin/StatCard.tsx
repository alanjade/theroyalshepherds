import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function StatCard({
  label, value, icon: Icon, href,
}: { label: string; value: number | string; icon: LucideIcon; href?: string }) {
  const content = (
    <div className="bg-white rounded-xl2 border border-royal-100 shadow-card p-5 flex items-center gap-4 hover:border-royal-300 transition-colors">
      <div className="h-11 w-11 rounded-lg bg-royal-50 text-royal-700 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-royal-900">{value}</p>
        <p className="text-xs text-charcoal/60">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href as any}>{content}</Link> : content;
}
