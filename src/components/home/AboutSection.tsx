import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="relative py-24 lg:py-36 bg-sand overflow-hidden">
      {/* Subtle top blend from hero wave */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-sand to-transparent pointer-events-none" />

      {/* Decorative background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,hsl(var(--golden)_/_0.07),transparent_55%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">

          {/* Section label */}
          <div data-reveal>
            <span className="section-label">Welcome</span>
          </div>

          {/* Heading */}
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight"
          >
            Here at{" "}
            <span className="text-primary italic">KAM YOGA</span>
          </h2>

          {/* Decorative separator */}
          <div data-reveal data-reveal-delay="2" className="flex justify-center items-center gap-3 mt-7 mb-7">
            <div className="w-8 h-px bg-golden/45" />
            <div className="w-1 h-1 rounded-full bg-golden/60" />
            <div className="w-8 h-px bg-golden/45" />
          </div>

          {/* Body text */}
          <div data-reveal data-reveal-delay="2">
            <p className="font-body text-base sm:text-[1.05rem] text-muted-foreground leading-[1.85]">
              With over two decades of practice and teaching, I create a warm,
              authentic environment where every student — beginner or experienced —
              can find their own path to inner peace.
            </p>
          </div>

          {/* CTA */}
          <div data-reveal data-reveal-delay="4" className="mt-10">
            <Button
              asChild
              className="rounded-full px-8 min-h-[50px] bg-golden hover:bg-golden/92 text-lagoon-dark font-semibold shadow-soft hover:shadow-card hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 font-body text-sm"
            >
              <Link to="/#journey">
                My Journey
                <ArrowRight className="ml-2" size={15} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Subtle bottom fade into philosophy section */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sage-section/30 to-transparent pointer-events-none" />
    </section>
  );
};

export default AboutSection;
