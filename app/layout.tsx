import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.seo as { site_title?: string; meta_description?: string; keywords?: string[] };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: seo.site_title || settings.company_name, template: `%s | ${settings.company_name}` },
    description: seo.meta_description || settings.company_description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.site_title || settings.company_name,
      description: seo.meta_description || settings.company_description,
      siteName: settings.company_name,
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
