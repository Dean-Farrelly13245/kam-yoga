import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Kellyann creates the most nurturing, peaceful space. Her classes have become an essential part of my week — a true sanctuary from the busyness of life.",
    author: "Sarah M.",
    role: "Student since 2019",
  },
  {
    quote: "I came to yoga feeling disconnected from my body. Through Kellyann's gentle guidance, I've rediscovered a sense of peace I didn't know was possible.",
    author: "Michael T.",
    role: "Weekly class member",
  },
  {
    quote: "The meditation sessions have transformed how I handle stress. Kellyann's voice and presence are incredibly calming — she has a true gift.",
    author: "Emma O.",
    role: "Meditation student",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-sage-light/30">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
            Kind Words
          </span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            From the Community
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-card transition-shadow duration-300 border border-border/50"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="p-2 rounded-full bg-primary shadow-soft">
                  <Quote size={16} className="text-primary-foreground" />
                </div>
              </div>

              <blockquote className="mt-4 font-body text-foreground leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="font-heading text-lg font-medium text-foreground">
                  {testimonial.author}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
