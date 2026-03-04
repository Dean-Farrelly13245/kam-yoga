import { Sparkles, Heart, GraduationCap, Award } from "lucide-react";

const milestones = [
  {
    year: "1999",
    title: "The Journey Begins",
    description:
      "Started practising yoga, beginning a lifelong path of self-discovery and spiritual growth.",
    icon: Sparkles,
  },
  {
    year: "2008",
    title: "Teaching Begins",
    description:
      "Began sharing the gift of yoga with others, guiding students on their own journeys.",
    icon: Heart,
  },
  {
    year: "2008",
    title: "Dru Yoga Certification",
    description:
      "Completed 200-hour Dru Yoga Teacher Training in Birmingham, UK.",
    icon: GraduationCap,
  },
  {
    year: "2010",
    title: "Meditation Training",
    description:
      "Completed 200-hour Dru Meditation Teacher Training in Ireland.",
    icon: Award,
  },
  {
    year: "2010–2016",
    title: "Mentoring Others",
    description:
      "Served as assistant tutor with Dru Ireland for 6 years, supporting new teachers.",
    icon: Heart,
  },
  {
    year: "2015",
    title: "Rainbow Kids Yoga",
    description:
      "Trained in Rainbow Kids Yoga, bringing the practice to young hearts.",
    icon: Sparkles,
  },
  {
    year: "Present",
    title: "Continuing the Path",
    description:
      "Currently studying Atma Kriya Yoga with Bhakti Marga, deepening the spiritual journey.",
    icon: GraduationCap,
  },
];

const JourneySection = () => {
  return (
    <section
      id="journey"
      className="relative py-24 lg:py-36 bg-teal overflow-hidden"
    >
      {/* Gradient depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-dark/60 via-teal to-teal/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,hsl(var(--teal)_/_0.12),transparent_50%),radial-gradient(circle_at_85%_65%,hsl(var(--golden)_/_0.07),transparent_45%)] pointer-events-none" />

      <div className="relative container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-24">
          <div data-reveal>
            <span className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-golden/80 font-medium">
              The Journey
            </span>
          </div>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-pearl leading-tight"
          >
            Over Two Decades of Practice
          </h2>
          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-5 font-body text-base text-pearl/55 leading-relaxed max-w-md mx-auto"
          >
            A path guided by heart, deepened through practice, and shared with
            love.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical gradient line */}
            <div className="absolute left-[1.125rem] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-golden/28 to-transparent md:-translate-x-px" />

            {milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  data-reveal
                  data-reveal-delay={String(Math.min((index % 3) + 1, 5))}
                  className={`relative flex items-start mb-14 sm:mb-16 last:mb-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline node */}
                  <div
                    className="absolute left-[1.125rem] md:left-1/2 -translate-x-1/2 z-10 mt-5"
                    aria-hidden="true"
                  >
                    {/* Outer glow ring */}
                    <div className="w-8 h-8 rounded-full bg-golden/10 flex items-center justify-center">
                      {/* Inner ring */}
                      <div className="w-5 h-5 rounded-full bg-golden/18 ring-1 ring-golden/30 flex items-center justify-center">
                        {/* Core dot */}
                        <div className="w-2.5 h-2.5 rounded-full bg-golden shadow-[0_0_8px_hsl(var(--golden)_/_0.5)]" />
                      </div>
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`ml-14 md:ml-0 md:w-1/2 ${
                      isEven ? "md:pr-10 md:text-right" : "md:pl-10"
                    }`}
                  >
                    <div className="bg-pearl/10 backdrop-blur-sm rounded-xl p-6 sm:p-7 border border-pearl/15 hover:border-golden/30 hover:bg-pearl/14 hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
                      <span className="font-body text-[10px] font-semibold text-golden/85 uppercase tracking-[0.18em]">
                        {milestone.year}
                      </span>
                      <h3 className="mt-2 font-heading text-lg sm:text-xl font-medium text-pearl leading-snug">
                        {milestone.title}
                      </h3>
                      <p className="mt-3 font-body text-sm text-pearl/60 leading-[1.8]">
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

      {/* Wave transition to CTA section (sand) */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 md:h-20 block"
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            style={{ fill: "hsl(var(--sand))" }}
          />
        </svg>
      </div>
    </section>
  );
};

export default JourneySection;
