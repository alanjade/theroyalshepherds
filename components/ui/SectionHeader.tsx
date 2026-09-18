export function SectionHeader({
  eyebrow, title, description, align = "center",
}: { eyebrow?: string; title: string; description?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "max-w-2xl mx-auto text-center mb-12" : "max-w-2xl mb-12"}>
      {eyebrow && (
        <p className="text-gold-600 font-semibold tracking-wide uppercase text-xs mb-3">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-royal-900">{title}</h2>
      {description && <p className="mt-4 text-charcoal/70 leading-relaxed">{description}</p>}
    </div>
  );
}
