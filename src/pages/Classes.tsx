import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClassCard from "@/components/classes/ClassCard";
import ClassFilters from "@/components/classes/ClassFilters";
import BookingModal from "@/components/classes/BookingModal";
import { classesData, ClassItem } from "@/data/classes";

const Classes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync filter with URL params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && ["yoga", "meditation", "workshops", "kids"].includes(typeParam)) {
      setActiveFilter(typeParam === "workshops" ? "workshop" : typeParam);
    }
  }, [searchParams]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ type: filter === "workshop" ? "workshops" : filter });
    }
  };

  const handleBook = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  const filteredClasses = activeFilter === "all" 
    ? classesData 
    : classesData.filter((c) => c.type === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-sage-light/50 to-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
                Classes & Workshops
              </span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-light text-foreground">
                Find Your Practice
              </h1>
              <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed">
                Whether you're new to yoga or returning to deepen your practice, 
                there's a class waiting for you. Book your spot and step onto the mat.
              </p>
            </div>

            {/* Filters */}
            <div className="mt-12">
              <ClassFilters 
                activeFilter={activeFilter} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>
        </section>

        {/* Class Listings */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            {filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredClasses.map((classItem) => (
                  <ClassCard 
                    key={classItem.id} 
                    classItem={classItem} 
                    onBook={handleBook}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-body text-lg text-muted-foreground">
                  No classes available in this category at the moment.
                </p>
                <button
                  onClick={() => handleFilterChange("all")}
                  className="mt-4 font-body text-primary hover:text-sage-dark underline underline-offset-4 transition-colors"
                >
                  View all classes
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 lg:py-20 bg-card">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="font-heading text-xl font-medium text-foreground mb-2">
                  First Time?
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Arrive 10 minutes early. Wear comfortable clothing. All equipment is provided.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl font-medium text-foreground mb-2">
                  Cancellation Policy
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  24-hour notice required for cancellations. Late cancellations may incur a fee.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-xl font-medium text-foreground mb-2">
                  Private Sessions
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  One-on-one sessions available. Contact us to arrange a time that suits you.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal 
        classItem={selectedClass}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Classes;
