import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const AboutSection = () => {
  const aboutImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga4.jpeg`;

  return (
    <section className="relative py-28 lg:py-40 bg-sand overflow-hidden">
      <div
        className="bg-photo"
        style={
          {
            backgroundImage: `url(${aboutImage})`,
            ["--photo-opacity" as any]: 0.22,
            ["--photo-position" as any]: "center",
          }
        }
      />
      <div className="overlay-light" />

      {/* Subtle top blend from hero wave */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sand/95 via-sand/55 to-transparent pointer-events-none" />

      {/* Decorative background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,hsl(var(--golden)_/_0.07),transparent_55%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        <div className="max-w-3xl mx-auto text-center surface px-6 py-8 sm:px-8 sm:py-10">

          {/* Section label */}
          <div data-reveal>
            <span className="section-label">Welcome</span>
          </div>

          {/* Heading */}
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-5 font-heading text-4xl sm:text-5xl md:text-[3.45rem] font-medium text-foreground leading-tight"
          >
            Here at{" "}
            <span className="text-primary italic">KAM YOGA</span>
          </h2>

          {/* Decorative separator */}
          <div data-reveal data-reveal-delay="2" className="flex justify-center items-center gap-3 mt-8 mb-8">
            <div className="w-8 h-px bg-golden/45" />
            <div className="w-1 h-1 rounded-full bg-golden/60" />
            <div className="w-8 h-px bg-golden/45" />
          </div>

          {/* Body text */}
          <div data-reveal data-reveal-delay="2">
            <p className="font-body text-[1.04rem] sm:text-[1.15rem] text-muted-foreground leading-[1.72]">
              With over two decades of practice and teaching, I create a warm,
              authentic environment where every student — beginner or experienced —
              can find their own path to inner peace.
            </p>
          </div>

          {/* CTA */}
          <div data-reveal data-reveal-delay="4" className="mt-12">
            <Button
              asChild
              className="rounded-full px-9 min-h-[52px] bg-golden hover:bg-golden/92 text-teal-dark font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 font-body text-sm"
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
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-sage-section/42 via-sage-section/20 to-transparent pointer-events-none" />
    </section>
  );
};

export default AboutSection;
