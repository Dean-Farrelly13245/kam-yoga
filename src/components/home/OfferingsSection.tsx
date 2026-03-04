import { Link } from "react-router-dom";
import { ArrowRight, Flower2, Brain, Users, Baby } from "lucide-react";

const offerings = [
  {
    icon: Flower2,
    title: "Yoga Classes",
    description:
      "Gentle Dru Yoga classes that honour your body's wisdom, focusing on flowing movements, breathing techniques, and deep relaxation.",
    link: "/classes",
  },
  {
    icon: Brain,
    title: "Meditation",
    description:
      "Guided meditation sessions to cultivate inner stillness, clarity, and a deeper connection to your authentic self.",
    link: "/classes",
  },
  {
    icon: Users,
    title: "Workshops",
    description:
      "Immersive workshops exploring specific themes — from stress relief to seasonal practices and spiritual development.",
    link: "/classes",
  },
  {
    icon: Baby,
    title: "Children's Yoga",
    description:
      "Playful, imaginative yoga sessions designed to help young ones develop body awareness, focus, and emotional resilience.",
    link: "/classes",
  },
];

const OfferingsSection = () => {
  return (
    <section className="relative py-24 lg:py-36 bg-background overflow-hidden">
      {/* Top blend from philosophy */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-sage/8 to-transparent pointer-events-none" />

      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--golden)_/_0.05),transparent_45%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <div data-reveal>
            <span className="section-label">Offerings</span>
          </div>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight"
          >
            Ways to Practice Together
          </h2>
          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-5 font-body text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Whether you're new to yoga or deepening an established practice,
            there's a space for you here.
          </p>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            const delays = ["1", "2", "3", "4"] as const;
            return (
              <Link
                key={index}
                to={offering.link}
                data-reveal
                data-reveal-delay={delays[index]}
                className="group relative bg-sand/55 rounded-t-[3rem] rounded-b-2xl pt-12 pb-9 px-7 border border-border/50 shadow-soft hover:border-primary/30 hover:shadow-hover hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Icon circle */}
                <div className="w-20 h-20 rounded-full bg-teal-light border border-primary/10 flex items-center justify-center mb-7 shadow-soft group-hover:bg-primary/12 group-hover:border-primary/25 transition-all duration-300">
                  <Icon size={28} className="text-primary" />
                </div>

                <h3 className="font-heading text-xl font-medium text-foreground mb-3.5 italic">
                  {offering.title}
                </h3>

                <p className="font-body text-sm text-muted-foreground leading-[1.8] mb-5 flex-1">
                  {offering.description}
                </p>

                <span className="inline-flex items-center gap-1.5 font-body text-xs text-primary group-hover:text-accent transition-colors duration-200 font-medium">
                  Explore
                  <ArrowRight
                    size={12}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Wave transition to Journey section (teal) */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 md:h-20 block"
        >
          <path
            d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z"
            style={{ fill: "hsl(var(--teal))" }}
          />
        </svg>
      </div>
    </section>
  );
};

export default OfferingsSection;
