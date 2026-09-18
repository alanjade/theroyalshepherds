import { getSiteSettings } from "@/lib/settings";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ShieldCheck, HeartHandshake, Flame, Users, Award, Compass, Scale, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: "About", description: settings.company_description };
}

const OBJECTIVES = [
  { name: "Word of God", desc: "A sound, practical knowledge of the Bible." },
  { name: "Prayer Life", desc: "A truly prayerful life, committed to daily communication with God." },
  { name: "The Holy Spirit", desc: "To receive, possess and maintain the Holy Spirit — His gifts and His fruits." },
  { name: "Holy Living", desc: "Steadfast love, honesty, chastity and a deeply spiritual lifestyle, worthy of Christ's ambassadors." },
  { name: "Evangelism", desc: "Sound soul-winning principles, to peacefully and persuasively reach non-believers." },
  { name: "Good Citizenship", desc: "Self-reliance, resourcefulness, obedience, loyalty, mental alertness and consideration for others." },
  { name: "Physical & Practical Development", desc: "Physical fitness alongside handicrafts and professional skills useful to both the individual and the public." },
];

const TEN_LAWS = [
  "Love God above all else.",
  "Love others and remain kind and helpful.",
  "Accept Jesus Christ as Lord and Saviour with unwavering loyalty.",
  "Study the Holy Bible daily for guidance.",
  "Be prayerful constantly for oneself and others.",
  "Lead a holy life with clean thoughts, words and deeds.",
  "Maintain the Holy Spirit and allow Him to guide you.",
  "Attend church services regularly and participate actively.",
  "Preach the Gospel daily, seeking opportunities to win souls.",
  "Be loyal and obedient to Royal Shepherds officers, policies and regulations.",
];

const VALUES = [
  { icon: Flame, name: "Faith" }, { icon: Scale, name: "Discipline" },
  { icon: ShieldCheck, name: "Integrity" }, { icon: HeartHandshake, name: "Service" },
  { icon: Compass, name: "Leadership" }, { icon: Users, name: "Unity" },
  { icon: Award, name: "Excellence" },
];

const UNIFORM_COLORS = [
  { color: "Blue", meaning: "Loyalty to Christ", swatch: "bg-royal-700" },
  { color: "Gold", meaning: "Value and worth in Christ", swatch: "bg-gold-500" },
  { color: "White", meaning: "Purity", swatch: "bg-white border border-royal-200" },
  { color: "Red", meaning: "Sacrifice — representing the blood of Jesus", swatch: "bg-red-600" },
];

const KEY_DUTIES = [
  "Security and escort duty during major church events",
  "Crowd and traffic control",
  "Ceremonial honors at weddings and funerals",
  "First aid support",
  "Support for evangelism outreach",
  "Sanitation within church premises",
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
          <div className="text-charcoal/70 leading-relaxed space-y-4">
            <p>
              The Royal Shepherds is the official paramilitary youth organization of the Christ
              Apostolic Church (CAC) Worldwide. The movement was born out of a resolution by the
              church&apos;s General Executive Council, who met at the Ikeji-Arakeji Camp on
              May&nbsp;10, 2002 and unanimously agreed to establish a distinct uniformed youth wing
              for the church.
            </p>
            <p>
              The new organization was created to replace the Boys&apos; Brigade within CAC,
              giving the church a disciplined, regimental youth structure shaped around its own
              spiritual and cultural identity. Although founded in 2002, the movement grew into a
              full church-wide programme around 2004.
            </p>
            <p>
              Church leaders recognized that young people respond naturally to the identity,
              respect and structure that a uniformed, disciplined group provides. The Royal
              Shepherds was founded on that insight — to keep young people rooted in the church,
              deepen their spiritual growth, and build strong Christian character through
              discipline and service.
            </p>
            {/* <p className="text-sm text-charcoal/50">
              [Company-specific history not yet configured — add when your local company was
              founded, its early members, and any milestones, through the admin dashboard.]
            </p> */}
          </div>
        </div>

        <div>
          <SectionHeader title="Aims &amp; Objectives" align="left" />
          <p className="text-charcoal/70 leading-relaxed -mt-4 mb-6">
            The primary aim of the Royal Shepherds—the youth paramilitary movement of the Christ
            Apostolic Church (CAC) — is Character development and making all youths &quot;born
            again&quot; disciples of Christ and good citizens.
          </p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {OBJECTIVES.map((o, i) => (
              <div key={o.name} className="flex gap-4">
                <span className="shrink-0 h-8 w-8 rounded-full bg-royal-50 text-royal-700 font-display font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-royal-900">{o.name}</p>
                  <p className="text-sm text-charcoal/70 mt-0.5">{o.desc}</p>
                </div>
              </div>
            ))}
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
          <SectionHeader title="The Ten Laws" align="left"
            description="Every member commits to these ten laws." />
          <ol className="space-y-3 -mt-4">
            {TEN_LAWS.map((law, i) => (
              <li key={law} className="flex gap-4">
                <span className="shrink-0 h-7 w-7 rounded-full bg-royal-900 text-gold font-display font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-charcoal/70 leading-relaxed pt-0.5">{law}</p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <SectionHeader title="Our Uniform" align="left"
            description="Each color in the Royal Shepherds uniform carries meaning." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 -mt-4">
            {UNIFORM_COLORS.map((u) => (
              <div key={u.color} className="text-center">
                <div className={`h-10 w-10 mx-auto rounded-full ${u.swatch}`} />
                <p className="mt-2 text-sm font-semibold text-royal-900">{u.color}</p>
                <p className="text-xs text-charcoal/60">{u.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-royal-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gold-600" /> Key Duties
          </h2>
          <p className="text-charcoal/70 leading-relaxed mb-4">
            Beyond fellowship and training, members serve the church in practical, visible ways:
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-charcoal/70">
            {KEY_DUTIES.map((duty) => (
              <li key={duty} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />
                {duty}
              </li>
            ))}
          </ul>
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
