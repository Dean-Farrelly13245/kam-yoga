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
  const offeringsImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga5.png`;

  return (
    <section className="relative py-28 lg:py-40 bg-background overflow-hidden">
      <div
        className="bg-photo"
        style={
          {
            backgroundImage: `url(${offeringsImage})`,
            ["--photo-opacity" as any]: 0.16,
            ["--photo-position" as any]: "center",
          }
        }
      />
      <div className="overlay-light" />

      {/* Top blend from philosophy */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sage/14 via-sage/5 to-transparent pointer-events-none" />

      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--golden)_/_0.05),transparent_45%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-18 lg:mb-24 surface px-6 py-8 sm:px-8 sm:py-10">
          <div data-reveal>
            <span className="section-label">Offerings</span>
          </div>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-5 font-heading text-4xl sm:text-5xl md:text-[3.45rem] font-medium text-foreground leading-tight"
          >
            Ways to Practice Together
          </h2>
          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-6 font-body text-[1.02rem] sm:text-[1.12rem] text-muted-foreground leading-[1.72] max-w-2xl mx-auto"
          >
            Whether you're new to yoga or deepening an established practice,
            there's a space for you here.
          </p>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 max-w-6xl mx-auto">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            const delays = ["1", "2", "3", "4"] as const;
            return (
              <Link
                key={index}
                to={offering.link}
                data-reveal
                data-reveal-delay={delays[index]}
                className="card-premium group relative bg-sand/86 rounded-t-[3rem] rounded-b-2xl pt-13 pb-10 px-7 border border-border/48 shadow-[0_8px_28px_rgba(63,82,80,0.1),0_2px_10px_rgba(63,82,80,0.06)] hover:border-primary/38 hover:shadow-[0_20px_44px_rgba(63,82,80,0.18),0_8px_20px_rgba(63,82,80,0.09)] hover:-translate-y-2 transition-all duration-350 flex flex-col items-center text-center cursor-pointer"
              >
                {/* Icon circle */}
                <div className="w-[5.25rem] h-[5.25rem] rounded-full bg-teal-light border border-primary/14 flex items-center justify-center mb-8 shadow-[0_5px_16px_rgba(63,82,80,0.13)] group-hover:bg-primary/16 group-hover:border-primary/30 group-hover:scale-105 transition-all duration-350">
                  <Icon size={31} className="text-primary group-hover:scale-105 transition-transform duration-350" />
                </div>

                <h3 className="font-heading text-[1.35rem] font-medium text-foreground mb-4 italic">
                  {offering.title}
                </h3>

                <p className="font-body text-[0.95rem] text-muted-foreground leading-[1.72] mb-6 flex-1">
                  {offering.description}
                </p>

                <span className="inline-flex items-center gap-1.5 font-body text-[0.8rem] text-primary group-hover:text-accent transition-colors duration-250 font-medium tracking-wide">
                  Explore
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform duration-250"
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
