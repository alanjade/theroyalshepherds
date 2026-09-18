import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon = Inbox, title, description, action,
}: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl2 border border-dashed border-royal-200 bg-royal-50/40">
      <Icon className="h-10 w-10 text-royal-300 mb-4" aria-hidden />
      <p className="font-semibold text-royal-900">{title}</p>
      {description && <p className="text-sm text-charcoal/60 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
