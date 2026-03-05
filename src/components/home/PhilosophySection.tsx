import { Heart, Sparkles, Sun, Leaf } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Heart Connection",
    description:
      "Yoga is about authentic connection — to yourself, to others, and to the present moment. Every practice is an opportunity to come home to your heart.",
  },
  {
    icon: Sun,
    title: "Beyond the Mat",
    description:
      "True yoga extends far beyond physical postures. It's a way of living, breathing, and being that infuses every aspect of daily life with awareness.",
  },
  {
    icon: Sparkles,
    title: "Self-Awareness",
    description:
      "Through practice, you cultivate the ability to observe yourself without judgment — your thoughts, emotions, and patterns — creating space for growth.",
  },
  {
    icon: Leaf,
    title: "Present Moment",
    description:
      "The greatest gift you can give yourself is presence. Each breath, each movement, each moment is an invitation to be fully here, fully alive.",
  },
];

const PhilosophySection = () => {
  const philosophyImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga2.png`;

  return (
    <section className="relative py-28 lg:py-40 bg-sage/25 overflow-hidden">
      <div
        className="bg-photo"
        style={
          {
            backgroundImage: `url(${philosophyImage})`,
            ["--photo-opacity" as any]: 0.18,
            ["--photo-position" as any]: "center",
          }
        }
      />
      <div className="overlay-light" />

      {/* Top blend from sand */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sand/45 via-sand/18 to-transparent pointer-events-none" />

      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--teal)_/_0.06),transparent_55%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-18 lg:mb-24 surface px-6 py-8 sm:px-8 sm:py-10">
          <div data-reveal>
            <span className="section-label">Philosophy</span>
          </div>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-5 font-heading text-4xl sm:text-5xl md:text-[3.45rem] font-medium text-foreground leading-tight"
          >
            What Guides the Practice
          </h2>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 max-w-5xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            const delays = ["1", "2", "1", "2"] as const;
            return (
              <div
                key={index}
                data-reveal
                data-reveal-delay={delays[index]}
                className="card-premium group bg-background/96 rounded-2xl p-9 sm:p-11 border border-border/56 shadow-[0_8px_22px_rgba(43,68,67,0.08),0_2px_8px_rgba(43,68,67,0.06)] hover:border-primary/30 hover:shadow-[0_18px_38px_rgba(43,68,67,0.14),0_6px_18px_rgba(43,68,67,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Icon */}
                <div className="inline-flex p-4 rounded-xl bg-teal-light/92 mb-7 shadow-[0_4px_16px_rgba(52,94,90,0.15)] group-hover:bg-primary/16 transition-colors duration-300">
                  <Icon size={31} className="text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-heading text-[1.35rem] sm:text-[1.6rem] font-medium text-foreground mb-4 italic">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="font-body text-[0.95rem] sm:text-[1rem] text-muted-foreground leading-[1.72]">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom blend into offerings */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/40 via-background/16 to-transparent pointer-events-none" />
    </section>
  );
};

export default PhilosophySection;
