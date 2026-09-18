import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { NewsCard } from "@/components/public/NewsCard";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("news").select("title, excerpt, featured_image").eq("slug", slug).eq("status", "published").single();
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { type: "article", images: article.featured_image ? [article.featured_image] : undefined },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("news").select("*, news_categories(name)").eq("slug", slug).eq("status", "published").single();
  if (!article) notFound();

  const { data: related } = await supabase.from("news").select("*, news_categories(name)")
    .eq("status", "published").neq("id", article.id)
    .eq("category_id", article.category_id ?? "").limit(3);

  return (
    <article className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {article.news_categories?.name && (
          <p className="text-gold-600 font-semibold uppercase text-xs tracking-wide mb-2">{article.news_categories.name}</p>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-royal-900">{article.title}</h1>
        <p className="mt-3 text-sm text-charcoal/50">{article.published_at && formatDate(article.published_at)}</p>

        {article.featured_image && (
          <div className="relative aspect-[16/9] rounded-xl2 overflow-hidden bg-royal-100 mt-8">
            <Image src={article.featured_image} alt={article.title} fill className="object-cover" priority />
          </div>
        )}

        <div
          className="prose prose-royal max-w-none mt-8 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content ?? "") }}
        />
      </div>

      {related && related.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-16 border-t border-royal-100 pt-12">
          <h2 className="font-display text-xl font-bold text-royal-900 mb-6">Related Articles</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((n) => <NewsCard key={n.id} article={n} />)}
          </div>
        </div>
      )}
    </article>
  );
}
