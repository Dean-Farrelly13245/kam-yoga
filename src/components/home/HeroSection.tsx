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
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Sage-to-pearl gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-section via-pearl to-pearl" />
      
      {/* Subtle ambient blobs */}
      <div className="absolute top-16 right-0 w-72 h-72 bg-blue-sage/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 left-0 w-80 h-80 bg-sage/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-5 lg:px-8 pt-28 pb-24 md:py-40">
        <div className="max-w-2xl mx-auto text-center">
          {/* Thin sage separator — not teal */}
          <div className="flex justify-center mb-10">
            <div className="w-8 h-px bg-foreground/20" />
          </div>

          {/* Main Headline — slightly larger on mobile */}
          <h1 className="font-heading text-5xl leading-tight sm:text-6xl md:text-7xl font-light text-foreground tracking-tight animate-fade-in">
            Kamyoga
          </h1>
          
          <p className="mt-7 font-heading text-xl sm:text-2xl md:text-3xl text-foreground/70 font-light italic animate-fade-in [animation-delay:200ms] opacity-0">
            A lifelong journey of yoga, meditation,<br className="hidden sm:block" /> and heart connection
          </p>

          <p className="mt-7 font-body text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-loose animate-fade-in [animation-delay:400ms] opacity-0">
            Guided by over two decades of practice and lived experience, offering a space 
            for authentic self-discovery and inner peace.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in [animation-delay:600ms] opacity-0">
            <Button 
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-10 min-h-[54px] bg-sage-section hover:bg-sage border border-sage/50 hover:border-sage text-foreground shadow-soft hover:shadow-card transition-all duration-300 text-base font-body tracking-wide"
            >
              <Link to="/classes">
                View Classes
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full px-10 min-h-[54px] border-foreground/15 hover:bg-foreground/5 text-foreground/80 transition-all duration-300 text-base font-body"
            >
              <Link to="/#journey" onClick={handleJourneyClick}>
                About Kamyoga
              </Link>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-muted-foreground/50 animate-fade-in [animation-delay:1000ms] opacity-0">
            <span className="text-[10px] font-body uppercase tracking-[0.2em]">Scroll</span>
            <div className="w-px h-6 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
