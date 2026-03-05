import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const handleJourneyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("journey");
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const heroImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga1.png`;

  return (
    <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden bg-teal">
      <div
        className="bg-photo"
        style={
          {
            backgroundImage: `url(${heroImage})`,
            ["--photo-opacity" as any]: 0.6,
            ["--photo-position" as any]: "center 24%",
          }
        }
      />
      <div className="overlay-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,hsl(var(--teal)_/_0.2),transparent_45%),radial-gradient(ellipse_at_80%_85%,hsl(var(--golden)_/_0.12),transparent_45%)]" />

      {/* Soft ambient glows */}
      <div className="absolute top-[12%] right-[6%] w-80 h-80 bg-teal/8 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[18%] left-[4%] w-96 h-96 bg-golden/6 rounded-full blur-[80px] pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-golden/30 to-transparent" />

      <div className="relative container mx-auto px-5 lg:px-8 pt-32 pb-36 md:pt-40 md:pb-44">
        <div className="max-w-3xl mx-auto text-center surface-dark px-6 py-8 sm:px-8 sm:py-10">

          {/* Decorative flourish */}
          <div className="flex justify-center items-center gap-3 mb-12">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-golden/55" />
            <div className="w-1.5 h-1.5 rounded-full bg-golden/65" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-golden/55" />
          </div>

          {/* Brand Name */}
          <h1 className="font-heading text-[3.2rem] sm:text-7xl md:text-8xl lg:text-[6.2rem] font-medium text-pearl tracking-[0.12em] sm:tracking-[0.2em] md:tracking-[0.24em] leading-none drop-shadow-[0_2px_32px_rgba(0,0,0,0.2)] uppercase whitespace-nowrap">
            KAM YOGA
          </h1>

          {/* Tagline */}
          <p className="mt-6 font-heading text-[1.35rem] sm:text-[1.8rem] md:text-[2rem] text-[#D1A679] italic font-normal tracking-wide">
            Yoga by heart
          </p>

          {/* Supporting text */}
          <p className="mt-8 font-body text-base sm:text-lg text-pearl/72 font-light max-w-sm mx-auto leading-relaxed">
            A lifelong journey of yoga, meditation, and heart connection.
          </p>

          {/* CTAs */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-11 min-h-[56px] bg-golden hover:bg-golden/92 text-teal-dark font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.24)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 text-base font-body tracking-wide"
            >
              <Link to="/classes">
                Book a Class
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-10 min-h-[56px] bg-pearl/88 backdrop-blur-[2px] text-teal-dark border border-pearl/65 hover:bg-pearl/96 hover:border-pearl/90 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] text-base font-body shadow-[0_5px_18px_rgba(0,0,0,0.14)]"
            >
              <Link to="/classes">
                View Classes
              </Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2.5 text-pearl/38">
            <span className="text-[10px] font-body uppercase tracking-[0.32em]">Discover</span>
            <div className="w-px h-10 bg-gradient-to-b from-pearl/28 to-transparent" />
          </div>
        </div>
      </div>

      {/* Wave transition to About section (sand) */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 md:h-20 block"
        >
          <path
            d="M0,32 C360,0 1080,72 1440,32 L1440,80 L0,80 Z"
            style={{ fill: "hsl(var(--sand))" }}
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
