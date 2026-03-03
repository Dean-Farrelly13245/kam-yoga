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
    <section className="py-20 lg:py-32 bg-pearl">
      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-20">
          <span className="font-body text-xs uppercase tracking-widest text-teal font-medium">
            Kind Words
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            From the Community
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-sage-section rounded-2xl p-6 sm:p-8 border border-sage/30 hover:shadow-card transition-all duration-300 flex flex-col"
            >
              {/* Teal quote mark */}
              <div className="mb-5">
                <div className="inline-flex p-2 rounded-full bg-teal-light">
                  <Quote size={14} className="text-teal" />
                </div>
              </div>

              <blockquote className="font-body text-sm sm:text-base text-foreground leading-relaxed flex-1">
                "{testimonial.quote}"
              </blockquote>

              <div className="mt-6 pt-5 border-t border-sage/40">
                <p className="font-heading text-lg font-medium text-foreground">
                  {testimonial.author}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
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
