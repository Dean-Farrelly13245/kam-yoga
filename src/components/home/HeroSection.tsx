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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-light via-background to-lavender-light opacity-80" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-sage/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-lavender/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sand/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative Line */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-px bg-primary/40" />
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foreground leading-tight tracking-tight animate-fade-in">
            Kam Yoga
          </h1>
          
          <p className="mt-6 font-heading text-xl sm:text-2xl md:text-3xl text-foreground/80 font-light italic animate-fade-in [animation-delay:200ms] opacity-0">
            A lifelong journey of yoga, meditation, and heart connection
          </p>

          <p className="mt-8 font-body text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:400ms] opacity-0">
            Guided by over two decades of practice and lived experience, offering a space 
            for authentic self-discovery and inner peace.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:600ms] opacity-0">
            <Button 
              asChild
              size="lg"
              className="rounded-full px-8 py-6 bg-primary hover:bg-sage-dark text-primary-foreground shadow-card hover:shadow-hover transition-all duration-300 text-base"
            >
              <Link to="/classes">
                View Classes
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 border-foreground/20 hover:bg-foreground/5 text-foreground transition-all duration-300 text-base"
            >
              <Link to="/#journey" onClick={handleJourneyClick}>
                About Kam Yoga
              </Link>
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-fade-in [animation-delay:1000ms] opacity-0">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs font-body uppercase tracking-widest">Scroll</span>
              <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
