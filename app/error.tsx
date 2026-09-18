"use client";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display text-3xl font-bold text-royal-900">Something went wrong</h1>
      <p className="mt-3 text-charcoal/60">We hit an unexpected error. No details are shown here for security reasons.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-royal-900 text-white px-6 py-2.5 text-sm font-semibold">
        Try again
      </button>
    </div>
  );
}
