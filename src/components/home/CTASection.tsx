import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const ctaImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga5.png`;

  return (
    <section className="relative py-28 lg:py-40 bg-sand overflow-hidden">
      <div
        className="bg-photo"
        style={
          {
            backgroundImage: `url(${ctaImage})`,
            ["--photo-opacity" as any]: 0.2,
            ["--photo-position" as any]: "center",
          }
        }
      />
      <div className="overlay-light" />
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-sand/58 to-transparent pointer-events-none" />

      {/* Ambient glow overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_25%,hsl(var(--teal)_/_0.07),transparent_40%),radial-gradient(ellipse_at_75%_75%,hsl(var(--golden)_/_0.12),transparent_45%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        <div className="max-w-xl mx-auto text-center surface px-6 py-8 sm:px-8 sm:py-10">

          {/* Decorative flourish */}
          <div
            data-reveal
            className="flex justify-center items-center gap-3 mb-11"
          >
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-golden/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-golden/65" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-golden/50" />
          </div>

          <h2
            data-reveal
            data-reveal-delay="1"
            className="font-heading text-4xl sm:text-5xl md:text-[3.45rem] font-medium text-foreground leading-tight"
          >
            Begin Your Journey
          </h2>

          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-7 font-body text-[1.02rem] sm:text-[1.12rem] text-muted-foreground leading-[1.72] max-w-md mx-auto"
          >
            Whether you're stepping onto the mat for the first time or returning
            after time away, you're welcome here. Come as you are.
          </p>

          <div
            data-reveal
            data-reveal-delay="3"
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-10 min-h-[56px] bg-golden hover:bg-golden/92 text-teal-dark font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 text-base font-body tracking-wide"
            >
              <Link to="/classes">
                View Upcoming Classes
                <ArrowRight className="ml-2" size={17} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-9 min-h-[56px] bg-pearl/62 backdrop-blur-[2px] border border-primary/28 hover:border-primary/46 hover:bg-pearl/78 text-primary hover:text-teal-dark transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] text-base font-body shadow-[0_4px_14px_rgba(62,95,92,0.08)]"
            >
              <Link to="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Wave transition to Footer (teal) */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 md:h-20 block"
        >
          <path
            d="M0,48 C480,0 960,80 1440,48 L1440,80 L0,80 Z"
            style={{ fill: "hsl(var(--teal))" }}
          />
        </svg>
      </div>
    </section>
  );
};

export default CTASection;
