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

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-lagoon">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-lagoon-dark via-lagoon to-lagoon/80" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-golden/8 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-golden/40 to-transparent" />

      <div className="relative container mx-auto px-5 lg:px-8 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative flourish */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-px bg-golden/60" />
          </div>

          {/* Brand Name */}
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-pearl tracking-tight">
            Kam Yoga
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal mt-1">
              Sanctuary
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="mt-6 font-heading text-xl sm:text-2xl md:text-3xl text-golden italic font-normal">
            Yoga by heart
          </p>

          {/* Supporting text */}
          <p className="mt-6 font-body text-base sm:text-lg text-pearl/70 font-light max-w-lg mx-auto leading-relaxed">
            A lifelong journey of yoga, meditation, and heart connection.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-10 min-h-[54px] bg-golden hover:bg-golden/90 text-lagoon-dark font-medium shadow-card hover:shadow-hover transition-all duration-300 text-base font-body tracking-wide"
            >
              <Link to="/classes">
                Book a Class
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full px-10 min-h-[54px] border-pearl/30 hover:bg-pearl/10 text-pearl transition-all duration-300 text-base font-body"
            >
              <Link to="/classes">
                View Classes
              </Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-pearl/40">
            <span className="text-[10px] font-body uppercase tracking-[0.25em]">Discover</span>
            <div className="w-px h-8 bg-gradient-to-b from-pearl/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
