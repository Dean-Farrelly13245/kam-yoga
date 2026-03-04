import { Link } from "react-router-dom";
import { ArrowRight, Flower2, Brain, Users, Baby } from "lucide-react";

const offerings = [
  {
    icon: Flower2,
    title: "Yoga Classes",
    description: "Gentle Dru Yoga classes that honour your body's wisdom, focusing on flowing movements, breathing techniques, and deep relaxation.",
    link: "/classes",
  },
  {
    icon: Brain,
    title: "Meditation",
    description: "Guided meditation sessions to cultivate inner stillness, clarity, and a deeper connection to your authentic self.",
    link: "/classes",
  },
  {
    icon: Users,
    title: "Workshops",
    description: "Immersive workshops exploring specific themes — from stress relief to seasonal practices and spiritual development.",
    link: "/classes",
  },
  {
    icon: Baby,
    title: "Children's Yoga",
    description: "Playful, imaginative yoga sessions designed to help young ones develop body awareness, focus, and emotional resilience.",
    link: "/classes",
  },
];

const OfferingsSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-20">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
            Our Offerings
          </span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-foreground">
            Ways to Practice Together
          </h2>
          <p className="mt-5 font-body text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Whether you're new to yoga or deepening an established practice, 
            there's a space for you here.
          </p>
        </div>

        {/* Offerings Grid — elegant arch-top cards inspired by reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            return (
              <Link
                key={index}
                to={offering.link}
                className="group relative bg-sand rounded-t-full rounded-b-2xl pt-10 pb-7 px-6 border border-border/60 hover:border-primary/30 hover:shadow-card transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Icon in circle */}
                <div className="w-16 h-16 rounded-full bg-teal-light flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-300">
                  <Icon size={24} className="text-primary" />
                </div>
                
                <h3 className="font-heading text-xl font-medium text-foreground mb-3 italic">
                  {offering.title}
                </h3>
                
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {offering.description}
                </p>
                
                <span className="inline-flex items-center gap-1.5 font-body text-xs text-primary group-hover:text-accent transition-colors duration-200">
                  Learn more
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OfferingsSection;
