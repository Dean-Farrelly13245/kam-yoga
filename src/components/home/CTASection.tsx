import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-24 lg:py-36 bg-sand overflow-hidden">
      {/* Ambient glow overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_25%,hsl(var(--teal)_/_0.07),transparent_40%),radial-gradient(ellipse_at_75%_75%,hsl(var(--golden)_/_0.12),transparent_45%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        <div className="max-w-xl mx-auto text-center">

          {/* Decorative flourish */}
          <div
            data-reveal
            className="flex justify-center items-center gap-3 mb-10"
          >
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-golden/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-golden/65" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-golden/50" />
          </div>

          <h2
            data-reveal
            data-reveal-delay="1"
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight"
          >
            Begin Your Journey
          </h2>

          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-6 font-body text-base sm:text-lg text-muted-foreground leading-[1.85] max-w-md mx-auto"
          >
            Whether you're stepping onto the mat for the first time or returning
            after time away, you're welcome here. Come as you are.
          </p>

          <div
            data-reveal
            data-reveal-delay="3"
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-9 min-h-[54px] bg-golden hover:bg-golden/92 text-lagoon-dark font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.18)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 text-base font-body tracking-wide"
            >
              <Link to="/classes">
                View Upcoming Classes
                <ArrowRight className="ml-2" size={17} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 min-h-[52px] bg-transparent border border-primary/38 hover:border-primary/58 hover:bg-primary/8 text-primary hover:text-primary transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] text-base font-body"
            >
              <Link to="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Wave transition to Footer (lagoon) */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 md:h-20 block"
        >
          <path
            d="M0,48 C480,0 960,80 1440,48 L1440,80 L0,80 Z"
            style={{ fill: "hsl(var(--lagoon))" }}
          />
        </svg>
      </div>
    </section>
  );
};

export default CTASection;
