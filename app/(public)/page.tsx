import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/public/EventCard";
import { NewsCard } from "@/components/public/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar, Newspaper, Image as ImageIcon, HeartHandshake, Users, ShieldCheck, Flame } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const settings = await getSiteSettings();
  const homepage = settings.homepage as {
    hero_title?: string; hero_subtitle?: string; hero_image?: string;
    cta_primary?: string; cta_secondary?: string;
    stats?: { label: string; value: string }[];
  };

  const [{ data: events }, { data: news }, { data: albums }] = await Promise.all([
    supabase.from("events").select("*").eq("status", "published")
      .gte("start_date", new Date().toISOString().slice(0, 10)).order("start_date").limit(6),
    supabase.from("news").select("*, news_categories(name)").eq("status", "published")
      .order("published_at", { ascending: false }).limit(6),
    supabase.from("gallery_albums").select("*, gallery_photos(image_url)").eq("published", true)
      .order("album_date", { ascending: false }).limit(6),
  ]);

  const activities = [
    { icon: Flame, title: "Christian Fellowship", desc: "Weekly gatherings centered on worship, prayer and the Word." },
    { icon: ShieldCheck, title: "Leadership Development", desc: "Structured training to raise disciplined, capable young leaders." },
    { icon: HeartHandshake, title: "Community Service", desc: "Practical outreach that puts faith into visible action." },
    { icon: Users, title: "Youth Development", desc: "Mentorship, camps and programmes built for growth." },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-royal-900 text-white">
        <div className="absolute inset-0">
          {homepage.hero_image ? (
            <Image src={homepage.hero_image} alt="" fill priority className="object-cover opacity-30" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-royal-900 via-royal-800 to-royal-900" />
          )}
          <div className="absolute inset-0 bg-royal-900/60" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center animate-fade-up">
          <p className="text-gold-300 font-semibold tracking-widest uppercase text-xs mb-4">{settings.company_motto}</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            {homepage.hero_title || `Welcome to The Royal Shepherds, ${settings.company_name}`}
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            {homepage.hero_subtitle ||
              "Building Christ-centered young people through faith, leadership, discipline, service and fellowship."}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/membership" variant="secondary" size="lg">
              {homepage.cta_primary || "Become a Member"}
            </Button>
            <Button href="/about" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              {homepage.cta_secondary || "Explore Our Company"}
            </Button>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader eyebrow="Who We Are" title={`About ${settings.company_name}`}
            description={settings.company_description} />
          <Button href="/about" variant="outline">Learn More</Button>
        </div>
      </section>

      {/* STATS */}
      {homepage.stats && homepage.stats.length > 0 && (
        <section className="py-16 bg-royal-900 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {homepage.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl font-bold text-gold-300">{s.value}</p>
                <p className="mt-2 text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ACTIVITIES */}
      <section className="py-20 bg-royal-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="What We Do" title="Our Activities"
            description="From fellowship to leadership training, every activity is designed to build faith, character and community." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((a) => (
              <div key={a.title} className="bg-white rounded-xl2 p-6 shadow-card border border-royal-100">
                <div className="h-12 w-12 rounded-full bg-royal-900 text-gold flex items-center justify-center mb-4">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-royal-900">{a.title}</h3>
                <p className="mt-2 text-sm text-charcoal/70">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Save the Date" title="Upcoming Events" />
          {events && events.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
              <div className="text-center mt-10">
                <Button href="/events" variant="outline">View All Events</Button>
              </div>
            </>
          ) : (
            <EmptyState icon={Calendar} title="No upcoming events" description="Check back soon for upcoming activities." />
          )}
        </div>
      </section>

      {/* LATEST NEWS */}
      <section className="py-20 bg-royal-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Stay Informed" title="Latest News" />
          {news && news.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((n) => <NewsCard key={n.id} article={n} />)}
              </div>
              <div className="text-center mt-10">
                <Button href="/news" variant="outline">View All News</Button>
              </div>
            </>
          ) : (
            <EmptyState icon={Newspaper} title="No news articles yet" />
          )}
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Moments" title="Gallery" />
          {albums && albums.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {albums.map((a) => (
                  <Link key={a.id} href={`/gallery/${a.slug}`} className="group relative aspect-square rounded-lg overflow-hidden bg-royal-100">
                    {(a.cover_image || a.gallery_photos?.[0]?.image_url) ? (
                      <Image src={a.cover_image || a.gallery_photos[0].image_url} alt={a.title} fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-royal-300">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Button href="/gallery" variant="outline">View Gallery</Button>
              </div>
            </>
          ) : (
            <EmptyState icon={ImageIcon} title="No gallery photos yet" />
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-royal-900 to-royal-800 text-white text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Be part of the journey.</h2>
          <p className="mt-4 text-white/80">
            Join a community of young people growing in faith, character and leadership.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/membership" variant="secondary" size="lg">Join Us</Button>
            <Button href="/contact" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
