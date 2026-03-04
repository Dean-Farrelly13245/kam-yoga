import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import PhilosophySection from "@/components/home/PhilosophySection";
import OfferingsSection from "@/components/home/OfferingsSection";
import JourneySection from "@/components/home/JourneySection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#journey") {
      setTimeout(() => {
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
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const targets = document.querySelectorAll("[data-reveal]");
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <PhilosophySection />
        <OfferingsSection />
        <JourneySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
