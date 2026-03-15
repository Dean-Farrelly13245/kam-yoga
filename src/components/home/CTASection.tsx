import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const ctaImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga5.png`;

  return (
    <section className="relative py-32 lg:py-48 bg-sand overflow-hidden">
      <div
        className="bg-photo"
        style={
          {
            backgroundImage: `url(${ctaImage})`,
            ["--photo-opacity" as any]: 0.26,
            ["--photo-position" as any]: "center 35%",
          }
        }
      />
      <div className="overlay-light" />
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-sand/65 to-transparent pointer-events-none" />

      {/* Ambient glow overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,hsl(var(--teal)_/_0.08),transparent_40%),radial-gradient(ellipse_at_80%_70%,hsl(var(--golden)_/_0.14),transparent_45%)] pointer-events-none" />

      <div className="container mx-auto px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center surface px-8 py-12 sm:px-12 sm:py-14">

          {/* Decorative flourish */}
          <div
            data-reveal
            className="flex justify-center items-center gap-3 mb-10"
          >
            <div className="w-14 h-px bg-gradient-to-r from-transparent to-golden/55" />
            <div className="w-1.5 h-1.5 rounded-full bg-golden/70 shadow-[0_0_6px_hsl(var(--golden)/0.4)]" />
            <div className="w-14 h-px bg-gradient-to-l from-transparent to-golden/55" />
          </div>

          <h2
            data-reveal
            data-reveal-delay="1"
            className="font-heading text-4xl sm:text-5xl md:text-[3.6rem] font-medium text-foreground leading-[1.15] tracking-tight"
          >
            Begin Your Journey
          </h2>

          {/* Subtle ruled divider beneath heading */}
          <div data-reveal data-reveal-delay="2" className="flex justify-center mt-7 mb-8">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
          </div>

          <p
            data-reveal
            data-reveal-delay="2"
            className="font-body text-[1.05rem] sm:text-[1.14rem] text-muted-foreground leading-[1.8] max-w-md mx-auto"
          >
            Whether you're stepping onto the mat for the first time or returning
            after time away, you're welcome here. Come as you are.
          </p>

          <div
            data-reveal
            data-reveal-delay="3"
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="btn-golden-glow w-full sm:w-auto rounded-full px-10 min-h-[56px] bg-golden hover:bg-golden/94 text-teal-dark font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:scale-[1.03] active:scale-[0.99] transition-all duration-300 text-base font-body tracking-wide"
            >
              <Link to="/classes">
                View Upcoming Classes
                <ArrowRight className="ml-2" size={17} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-9 min-h-[56px] bg-pearl/52 backdrop-blur-[12px] border border-primary/30 hover:border-primary/52 hover:bg-pearl/72 text-primary hover:text-teal-dark transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] text-base font-body shadow-[0_4px_14px_rgba(62,95,92,0.08)]"
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
