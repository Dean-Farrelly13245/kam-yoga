import { Heart, Sparkles, Sun, Leaf } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Heart Connection",
    description: "Yoga is about authentic connection — to yourself, to others, and to the present moment. Every practice is an opportunity to come home to your heart.",
  },
  {
    icon: Sun,
    title: "Beyond the Mat",
    description: "True yoga extends far beyond physical postures. It's a way of living, breathing, and being that infuses every aspect of daily life with awareness.",
  },
  {
    icon: Sparkles,
    title: "Self-Awareness",
    description: "Through practice, we cultivate the ability to observe ourselves without judgment — our thoughts, emotions, and patterns — creating space for growth.",
  },
  {
    icon: Leaf,
    title: "Present Moment",
    description: "The greatest gift we can give ourselves is presence. Each breath, each movement, each moment is an invitation to be fully here, fully alive.",
  },
];

const PhilosophySection = () => {
  return (
    <section className="py-20 lg:py-32 bg-pearl">
      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-20">
          <span className="font-body text-xs uppercase tracking-widest text-teal font-medium">
            Philosophy
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            What Guides the Practice
          </h2>
          <p className="mt-5 font-body text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            At the core of Kamyoga lies a simple belief: yoga is not about perfection, 
            but about presence. Not about achievement, but about awareness.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div 
                key={index}
                className="group bg-sage-section rounded-2xl p-6 sm:p-8 border border-sage/30 hover:border-teal/30 hover:shadow-card transition-all duration-300"
              >
                <div className="inline-flex p-2.5 rounded-xl bg-teal-light mb-5">
                  <Icon size={22} className="text-teal" />
                </div>
                <h3 className="font-heading text-2xl font-medium text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
