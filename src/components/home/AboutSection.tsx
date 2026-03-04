import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-sand">
      <div className="container mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Text Content */}
          <div>
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">
              Welcome
            </span>
            <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight">
              Here at{" "}
              <span className="text-primary italic">Kam Yoga Sanctuary</span>
            </h2>
            <p className="mt-6 font-body text-base text-muted-foreground leading-loose">
              Welcome to Kam Yoga Sanctuary, a nurturing space where we honour the ancient 
              wisdom of yoga to guide you on your journey to balance and well-being. 
              Our holistic approach is centred around three foundational principles: 
              movement, stillness, and heart connection.
            </p>
            <p className="mt-4 font-body text-base text-muted-foreground leading-loose">
              With over two decades of practice and teaching, we create a warm, 
              authentic environment where every student — beginner or experienced — 
              can find their own path to inner peace.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="rounded-full px-8 min-h-[48px] bg-golden hover:bg-golden/90 text-lagoon-dark font-medium shadow-soft hover:shadow-card transition-all duration-300 font-body"
              >
                <Link to="/#journey">
                  Our Journey
                  <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Visual Card */}
          <div className="relative">
            <div className="bg-sage/30 rounded-3xl p-8 lg:p-10 border border-teal/20">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center">
                  <span className="font-heading text-2xl text-primary">🕉</span>
                </div>
                <blockquote className="font-heading text-xl sm:text-2xl text-foreground italic leading-relaxed">
                  "Yoga is not about touching your toes. It's about what you learn on the way down."
                </blockquote>
                <p className="font-body text-sm text-muted-foreground">— Jigar Gor</p>
              </div>
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-golden/15 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
