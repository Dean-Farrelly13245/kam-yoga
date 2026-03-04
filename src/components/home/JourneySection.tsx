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
    year: "2010–2016",
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
    <section id="journey" className="py-20 lg:py-28 bg-lagoon">
      <div className="container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-20">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-golden font-medium">
            The Journey
          </span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-pearl">
            Over Two Decades of Practice
          </h2>
          <p className="mt-5 font-body text-base text-pearl/60 leading-relaxed max-w-xl mx-auto">
            A path guided by heart, deepened through practice, and shared with love.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-pearl/20 md:-translate-x-px" />

            {milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index}
                  className={`relative flex items-start mb-8 last:mb-0 md:gap-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-5 md:left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-golden z-10 mt-6" />
                  
                  {/* Card */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${isEven ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                    <div className="bg-pearl/10 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-pearl/15 hover:border-golden/30 transition-all duration-300">
                      <span className="font-body text-[10px] font-semibold text-golden uppercase tracking-[0.15em]">
                        {milestone.year}
                      </span>
                      <h3 className="mt-1.5 font-heading text-lg sm:text-xl font-medium text-pearl">
                        {milestone.title}
                      </h3>
                      <p className="mt-2 font-body text-sm text-pearl/60 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

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
