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
  const journeyImage = `${import.meta.env.BASE_URL || "/"}photos/kamyoga3.png`;

  return (
    <section
      id="journey"
      className="relative py-28 lg:py-40 bg-teal overflow-hidden"
    >
      <div
        className="bg-photo"
        style={
          {
            backgroundImage: `url(${journeyImage})`,
            ["--photo-opacity" as any]: 0.24,
            ["--photo-position" as any]: "center",
            ["--overlay-start" as any]: "hsl(var(--teal-dark) / 0.66)",
            ["--overlay-mid" as any]: "hsl(var(--teal) / 0.46)",
            ["--overlay-end" as any]: "hsl(var(--teal-dark) / 0.58)",
          }
        }
      />
      <div className="overlay-dark" />

      {/* Gradient depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-dark/52 via-teal/84 to-teal/76 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,hsl(var(--teal)_/_0.12),transparent_50%),radial-gradient(circle_at_85%_65%,hsl(var(--golden)_/_0.07),transparent_45%)] pointer-events-none" />

      <div className="relative container mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20 surface-dark px-6 py-8 sm:px-8 sm:py-10">
          <div data-reveal>
            <span className="section-label text-golden/85">
              The Journey
            </span>
          </div>
          <h2
            data-reveal
            data-reveal-delay="1"
            className="mt-5 font-heading text-4xl sm:text-5xl md:text-[3.45rem] font-medium text-pearl leading-tight"
          >
            Over Two Decades of Practice
          </h2>
          <p
            data-reveal
            data-reveal-delay="2"
            className="mt-6 font-body text-[1.02rem] text-pearl/66 leading-relaxed max-w-md mx-auto"
          >
            A path guided by heart, deepened through practice, and shared with
            love.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical gradient line */}
            <div className="timeline-line absolute left-[1.125rem] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px" />

            {milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              const MilestoneIcon = milestone.icon;
              return (
                <div
                  key={index}
                  data-reveal
                  data-reveal-delay={String(Math.min((index % 3) + 1, 5))}
                  className={`relative flex items-start mb-14 sm:mb-18 last:mb-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline node */}
                  <div
                    className="absolute left-[1.125rem] md:left-1/2 -translate-x-1/2 z-10 mt-5"
                    aria-hidden="true"
                  >
                    {/* Outer glow ring */}
                    <div className="w-8 h-8 rounded-full bg-golden/16 flex items-center justify-center shadow-[0_0_0_5px_hsl(var(--golden)_/_0.08),0_0_12px_hsl(var(--golden)_/_0.15)]">
                      {/* Inner icon ring */}
                      <div className="w-[1.375rem] h-[1.375rem] rounded-full bg-golden/30 ring-1 ring-golden/55 flex items-center justify-center shadow-[0_0_8px_hsl(var(--golden)_/_0.45)]">
                        <MilestoneIcon size={11} className="text-golden" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`ml-14 md:ml-0 md:w-1/2 ${
                      isEven ? "md:pr-10 md:text-right" : "md:pl-10"
                    }`}
                  >
                    <div className="card-premium bg-pearl/13 backdrop-blur-[16px] rounded-xl p-7 sm:p-8 border border-pearl/16 hover:border-golden/38 hover:bg-pearl/18 hover:-translate-y-1.5 transition-all duration-350 shadow-[0_10px_32px_rgba(0,0,0,0.16),0_3px_10px_rgba(0,0,0,0.09)] cursor-default">
                      <span className="font-body text-[10px] font-semibold text-golden/88 uppercase tracking-[0.22em]">
                        {milestone.year}
                      </span>
                      <h3 className="mt-3 font-heading text-xl sm:text-[1.35rem] font-medium text-pearl leading-snug">
                        {milestone.title}
                      </h3>
                      <p className="mt-4 font-body text-[0.94rem] text-pearl/70 leading-[1.76]">
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
