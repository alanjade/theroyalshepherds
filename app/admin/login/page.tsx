import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="min-h-screen bg-royal-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl2 shadow-card p-8">
        <div className="text-center mb-6">
          <span className="inline-flex h-12 w-12 rounded-full bg-royal-900 text-gold items-center justify-center font-bold">RS</span>
          <h1 className="mt-4 font-display text-xl font-bold text-royal-900">Admin Sign In</h1>
          <p className="text-sm text-charcoal/60">The Royal Shepherds Administration</p>
        </div>
        <LoginForm redirectTo={next || "/admin"} />
      </div>
    </div>
  );
}
