import { requireUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import Link from "next/link";

// Deliberately NOT wrapped in RequireAdmin: accounts that must change their
// password are redirected here, and RequireAdmin would redirect them back.
export default async function ChangePasswordPage() {
  const { profile } = await requireUser();
  const forced = profile.must_change_password;

  return (
    <div className="min-h-screen bg-royal-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl2 shadow-card p-8">
        <div className="text-center mb-6">
          <span className="inline-flex h-12 w-12 rounded-full bg-royal-900 text-gold items-center justify-center font-bold">RS</span>
          <h1 className="mt-4 font-display text-xl font-bold text-royal-900">
            {forced ? "Set Your Password" : "Change Password"}
          </h1>
          <p className="text-sm text-charcoal/60">
            {forced
              ? "You signed in with a temporary password. Choose your own to continue."
              : "Choose a new password for your account."}
          </p>
        </div>
        <ChangePasswordForm />
        {!forced && (
          <p className="text-center text-xs mt-4"><Link href="/admin" className="text-royal-700 hover:text-gold-600">Back to dashboard</Link></p>
        )}
      </div>
    </div>
  );
}
