import { Sparkles, Heart, GraduationCap, Award } from "lucide-react";

const milestones = [
  {
    year: "1999",
    title: "The Journey Begins",
    description: "Started practising yoga, beginning a lifelong path of self-discovery and spiritual growth.",
    icon: Sparkles,
  },
  {
    year: "2008",
    title: "Teaching Begins",
    description: "Began sharing the gift of yoga with others, guiding students on their own journeys.",
    icon: Heart,
  },
  {
    year: "2008",
    title: "Dru Yoga Certification",
    description: "Completed 200-hour Dru Yoga Teacher Training in Birmingham, UK.",
    icon: GraduationCap,
  },
  {
    year: "2010",
    title: "Meditation Training",
    description: "Completed 200-hour Dru Meditation Teacher Training in Ireland.",
    icon: Award,
  },
  {
    year: "2010-2016",
    title: "Mentoring Others",
    description: "Served as assistant tutor with Dru Ireland for 6 years, supporting new teachers.",
    icon: Heart,
  },
  {
    year: "2015",
    title: "Rainbow Kids Yoga",
    description: "Trained in Rainbow Kids Yoga, bringing the practice to young hearts.",
    icon: Sparkles,
  },
  {
    year: "Present",
    title: "Continuing the Path",
    description: "Currently studying Atma Kriya Yoga with Bhakti Marga, deepening the spiritual journey.",
    icon: GraduationCap,
  },
];

const JourneySection = () => {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
            The Journey
          </span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            Over Two Decades of Practice
          </h2>
          <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed">
            Yoga is not a destination but a lifelong journey of self-discovery, 
            growth, and connection. Here is the path that has shaped Kam Yoga.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index}
                  className={`relative flex items-start gap-8 mb-12 last:mb-0 md:gap-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Icon Circle */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-soft z-10" />
                  
                  {/* Content Card */}
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${isEven ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="bg-background rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300">
                      <div className={`flex items-center gap-3 mb-3 ${isEven ? "md:justify-end" : ""}`}>
                        <div className="p-2 rounded-full bg-sage-light">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <span className="font-body text-sm font-medium text-primary">
                          {milestone.year}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-medium text-foreground mb-2">
                        {milestone.title}
                      </h3>
                      <p className="font-body text-muted-foreground leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for other side */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
