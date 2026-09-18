import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <RequireAdmin minRole="admin">
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-royal-900">Site Settings</h1>
          <p className="text-sm text-charcoal/60">Configure branding, contact details and homepage content.</p>
        </div>
        <SettingsForm settings={settings} />
      </div>
    </RequireAdmin>
  );
}
