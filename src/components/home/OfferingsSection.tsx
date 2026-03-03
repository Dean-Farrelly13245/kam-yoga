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
    <section className="py-20 lg:py-32 bg-blue-sage-section">
      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-20">
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/45 font-medium">
            Offerings
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            Ways to Practice Together
          </h2>
          <p className="mt-5 font-body text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Whether you're new to yoga or deepening an established practice, 
            there's a space for you here.
          </p>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            return (
              <Link
                key={index}
                to={offering.link}
                className="group bg-pearl rounded-2xl p-6 sm:p-7 border border-border/30 hover:bg-sage-light/40 active:bg-sage-light/60 transition-colors duration-200 flex flex-col"
              >
                <div className="inline-flex p-2.5 rounded-lg bg-foreground/5 mb-5 self-start">
                  <Icon size={20} className="text-foreground/50" />
                </div>
                
                <h3 className="font-heading text-xl font-medium text-foreground mb-2">
                  {offering.title}
                </h3>
                
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {offering.description}
                </p>
                
                <span className="inline-flex items-center gap-1.5 font-body text-xs text-foreground/40 group-hover:text-foreground/60 transition-colors duration-200">
                  View classes
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
