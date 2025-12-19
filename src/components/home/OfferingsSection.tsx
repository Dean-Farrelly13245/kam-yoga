import { Link } from "react-router-dom";
import { ArrowRight, Flower2, Brain, Users, Baby } from "lucide-react";

const offerings = [
  {
    icon: Flower2,
    title: "Yoga Classes",
    description: "Gentle Dru Yoga classes that honour your body's wisdom, focusing on flowing movements, breathing techniques, and deep relaxation.",
    link: "/classes?type=yoga",
  },
  {
    icon: Brain,
    title: "Meditation",
    description: "Guided meditation sessions to cultivate inner stillness, clarity, and a deeper connection to your authentic self.",
    link: "/classes?type=meditation",
  },
  {
    icon: Users,
    title: "Workshops",
    description: "Immersive workshops exploring specific themes — from stress relief to seasonal practices and spiritual development.",
    link: "/classes?type=workshops",
  },
  {
    icon: Baby,
    title: "Children's Yoga",
    description: "Playful, imaginative yoga sessions designed to help young ones develop body awareness, focus, and emotional resilience.",
    link: "/classes?type=kids",
  },
];

const OfferingsSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
            Offerings
          </span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            Ways to Practice Together
          </h2>
          <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed">
            Whether you're new to yoga or deepening an established practice, 
            there's a space for you here.
          </p>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            return (
              <Link
                key={index}
                to={offering.link}
                className="group relative bg-background rounded-2xl p-6 shadow-soft hover:shadow-hover transition-all duration-300 border border-border/50 hover:border-primary/20"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-sage-light/30 to-lavender-light/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="inline-flex p-3 rounded-xl bg-sand-light group-hover:bg-sage-light transition-colors duration-300 mb-5">
                    <Icon size={24} className="text-clay group-hover:text-primary transition-colors duration-300" />
                  </div>
                  
                  <h3 className="font-heading text-xl font-medium text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {offering.title}
                  </h3>
                  
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                    {offering.description}
                  </p>
                  
                  <span className="inline-flex items-center gap-1 font-body text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OfferingsSection;
