import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/dates";
import type { Database } from "@/types/database";

type News = Database["public"]["Tables"]["news"]["Row"] & { news_categories?: { name: string } | null };

export function NewsCard({ article }: { article: News }) {
  return (
    <Card className="group flex flex-col h-full">
      <div className="relative aspect-[16/10] bg-royal-100">
        {article.featured_image ? (
          <Image src={article.featured_image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-royal-300">
            <Newspaper className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {article.news_categories?.name && (
          <span className="text-xs font-semibold text-gold-600 uppercase tracking-wide">{article.news_categories.name}</span>
        )}
        <h3 className="mt-1 font-display font-bold text-lg text-royal-900 line-clamp-2">{article.title}</h3>
        {article.excerpt && <p className="mt-2 text-sm text-charcoal/70 line-clamp-3">{article.excerpt}</p>}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs text-charcoal/50">{article.published_at ? formatDate(article.published_at) : "Unpublished"}</span>
          <Link href={`/news/${article.slug}`} className="text-sm font-semibold text-royal-700 hover:text-gold-600">
            Read more &rarr;
          </Link>
        </div>
      </div>
    </Card>
  );
}
