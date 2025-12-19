import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClassCard from "@/components/classes/ClassCard";
import BookingModal from "@/components/classes/BookingModal";
import { supabase, Class } from "@/lib/supabaseClient";

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("is_published", true)
        .order("date", { ascending: true });

      if (error) {
        console.error("Supabase error loading classes:", error);
        throw error;
      }
      
      console.log("Loaded classes:", data?.length || 0, data);
      setClasses(data || []);
    } catch (error) {
      console.error("Error loading classes:", error);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

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
          </div>
        </section>

        {/* Class Listings */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-16">
                <p className="font-body text-lg text-muted-foreground">
                  Loading classes...
                </p>
              </div>
            ) : classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {classes.map((classItem) => (
                  <ClassCard 
                    key={classItem.id} 
                    classItem={classItem} 
                    onBook={handleBook}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-body text-lg text-muted-foreground mb-4">
                  No classes available at the moment.
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Make sure your class is published in the admin dashboard.
                </p>
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
