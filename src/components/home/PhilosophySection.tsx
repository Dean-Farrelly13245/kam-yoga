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
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background via-lavender-light/30 to-background">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
            Philosophy
          </span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            What Guides the Practice
          </h2>
          <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed">
            At the core of Kam Yoga lies a simple belief: yoga is not about perfection, 
            but about presence. Not about achievement, but about awareness.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div 
                key={index}
                className="group relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-card transition-all duration-300 border border-border/50"
              >
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-sage-light/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="inline-flex p-3 rounded-xl bg-sage-light mb-5">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-medium text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quote */}
        <div className="max-w-3xl mx-auto mt-20 text-center">
          <blockquote className="font-heading text-2xl md:text-3xl font-light text-foreground italic leading-relaxed">
            "The yoga mat is a mirror — it reflects back to us who we are and 
            who we are becoming."
          </blockquote>
          <p className="mt-6 font-body text-muted-foreground">— Kellyann, Kam Yoga</p>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
