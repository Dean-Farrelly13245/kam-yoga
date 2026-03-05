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
  const philosophyImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga4.jpeg`;

  return (
    <section className="relative py-24 lg:py-36 bg-sage/25 overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="w-full h-full bg-center bg-cover opacity-14"
          style={{ backgroundImage: `url(${philosophyImage})` }}
        />
      </div>
      <div className="absolute inset-0 bg-sage/55 pointer-events-none" />

      {/* Top blend from sand */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-sand/40 to-transparent pointer-events-none" />

      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--teal)_/_0.06),transparent_55%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div data-reveal>
            <span className="section-label">Philosophy</span>
          </div>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight"
          >
            What Guides the Practice
          </h2>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            const delays = ["1", "2", "1", "2"] as const;
            return (
              <div
                key={index}
                data-reveal
                data-reveal-delay={delays[index]}
                className="card-premium group bg-background rounded-2xl p-8 sm:p-10 border border-border/55 shadow-soft hover:border-primary/28 hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Icon */}
                <div className="inline-flex p-3.5 rounded-xl bg-teal-light mb-6 shadow-soft group-hover:bg-primary/14 transition-colors duration-300">
                  <Icon size={28} className="text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-heading text-xl sm:text-2xl font-medium text-foreground mb-3.5 italic">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="font-body text-sm sm:text-[0.925rem] text-muted-foreground leading-[1.8]">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom blend into offerings */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
    </section>
  );
};

export default PhilosophySection;
