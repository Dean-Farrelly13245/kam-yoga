import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative Element */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-px bg-primary/40" />
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <div className="w-12 h-px bg-primary/40" />
            </div>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight">
            Begin Your Journey
          </h2>
          
          <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Whether you're taking your first step onto the mat or returning after time away, 
            you're welcome here. Come as you are.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild
              size="lg"
              className="rounded-full px-8 py-6 bg-primary hover:bg-sage-dark text-primary-foreground shadow-card hover:shadow-hover transition-all duration-300 text-base"
            >
              <Link to="/classes">
                View Upcoming Classes
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 border-foreground/20 hover:bg-foreground/5 text-foreground transition-all duration-300 text-base"
            >
              <Link to="/contact">
                Contact Kellyann
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
