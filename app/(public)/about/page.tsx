import { getSiteSettings } from "@/lib/settings";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ShieldCheck, HeartHandshake, Flame, Users, Award, Compass, Scale } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: "About", description: settings.company_description };
}

const VALUES = [
  { icon: Flame, name: "Faith" }, { icon: Scale, name: "Discipline" },
  { icon: ShieldCheck, name: "Integrity" }, { icon: HeartHandshake, name: "Service" },
  { icon: Compass, name: "Leadership" }, { icon: Users, name: "Unity" },
  { icon: Award, name: "Excellence" },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center">
          <p className="text-gold-600 font-semibold tracking-wide uppercase text-xs mb-3">About Us</p>
          <h1 className="font-display text-4xl font-bold text-royal-900">{settings.company_name}</h1>
          <p className="mt-4 text-charcoal/70 leading-relaxed">{settings.company_description}</p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-royal-900 mb-3">Our History</h2>
          <p className="text-charcoal/70 leading-relaxed">
            [Company history not yet configured — add your company&apos;s founding story, milestones and
            growth through the admin dashboard settings.]
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-royal-900 mb-3">Vision</h2>
            <p className="text-charcoal/70 leading-relaxed">
              [Vision statement not yet configured — replace with your company&apos;s vision.]
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-royal-900 mb-3">Mission</h2>
            <p className="text-charcoal/70 leading-relaxed">
              [Mission statement not yet configured — replace with your company&apos;s mission.]
            </p>
          </div>
        </div>

        <div>
          <SectionHeader title="Core Values" align="left" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 -mt-4">
            {VALUES.map((v) => (
              <div key={v.name} className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-royal-900 text-gold flex items-center justify-center">
                  <v.icon className="h-6 w-6" />
                </div>
                <p className="mt-2 text-sm font-semibold text-royal-900">{v.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-royal-900 mb-3">Our Activities</h2>
          <p className="text-charcoal/70 leading-relaxed">
            Our company runs regular fellowship meetings, leadership training, community outreach,
            camps and youth development programmes. Visit the <a href="/events" className="text-royal-700 font-semibold hover:text-gold-600">Events page</a> for
            what&apos;s coming up.
          </p>
        </div>
      </div>
    </div>
  );
}
