import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NewsCard } from "@/components/public/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Newspaper } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "News" };
const PAGE_SIZE = 9;

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const search = sp.search?.trim();

  const supabase = await createClient();
  const [{ data: categories }] = await Promise.all([supabase.from("news_categories").select("*").order("display_order")]);

  let query = supabase.from("news").select("*, news_categories(name)", { count: "exact" }).eq("status", "published");
  if (search) query = query.ilike("title", `%${search}%`);
  if (sp.category) query = query.eq("category_id", sp.category);
  query = query.order("published_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data: news, count } = await query;

  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Stay Informed" title="News" />
        <form className="flex flex-wrap gap-3 justify-center mb-10" action="/news">
          <input name="search" defaultValue={search} placeholder="Search news…"
            className="rounded-full border border-royal-200 px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-royal-300" />
          <select name="category" defaultValue={sp.category ?? ""} className="rounded-full border border-royal-200 px-4 py-2 text-sm">
            <option value="">All Categories</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </form>
        {news && news.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n) => <NewsCard key={n.id} article={n} />)}
          </div>
        ) : (
          <EmptyState icon={Newspaper} title="No news articles found" />
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/news" searchParams={{ search, category: sp.category }} />
      </div>
    </div>
  );
}
