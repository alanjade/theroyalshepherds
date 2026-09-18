import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display text-4xl font-bold text-royal-900">Page Not Found</h1>
      <p className="mt-3 text-charcoal/60">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="mt-6 text-royal-700 font-semibold hover:text-gold-600">Back to Home &rarr;</Link>
    </div>
  );
}
