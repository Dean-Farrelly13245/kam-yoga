import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 lg:py-32 bg-sage-section">
      <div className="container mx-auto px-5 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          {/* Neutral separator */}
          <div className="flex justify-center mb-10">
            <div className="w-8 h-px bg-foreground/20" />
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight">
            Begin Your Journey
          </h2>
          
          <p className="mt-6 font-body text-base sm:text-lg text-muted-foreground leading-loose max-w-md mx-auto">
            Whether you're taking your first step onto the mat or returning after time away, 
            you're welcome here. Come as you are.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 min-h-[52px] bg-pearl hover:bg-sand-light border border-foreground/25 hover:border-foreground/35 text-foreground shadow-soft hover:shadow-card transition-all duration-300 text-base font-body"
            >
              <Link to="/classes">
                View Upcoming Classes
                <ArrowRight className="ml-2" size={17} />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 min-h-[52px] border-foreground/20 hover:bg-foreground/5 text-foreground transition-all duration-300 text-base font-body"
            >
              <Link to="/contact">
                Contact
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
