import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClassCard from "@/components/classes/ClassCard";
import BookingModal from "@/components/classes/BookingModal";
import { supabase, PublishedSession } from "@/lib/supabaseClient";
import { siteLocation } from "@/config/site";

const Classes = () => {
  const [sessions, setSessions] = useState<PublishedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<PublishedSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase.rpc("get_published_classes");
      if (error) throw error;

      const mapped = (data || []).map((item: any) => {
        const remaining =
          item.capacity !== null && item.paid_count !== null
            ? Math.max(item.capacity - item.paid_count, 0)
            : null;
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          starts_at: item.starts_at,
          ends_at: item.ends_at,
          price_cents: item.price_cents,
          currency: item.currency || "eur",
          capacity: item.capacity,
          is_active: item.is_active,
          created_at: item.created_at,
          paid_count: item.paid_count,
          remaining_spots: remaining,
        } as PublishedSession;
      });
      setSessions(mapped);
    } catch (error) {
      console.error("Error loading sessions:", error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = (sessionItem: PublishedSession) => {
    setSelectedSession(sessionItem);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-gradient-to-b from-sage-section to-background overflow-hidden">
          <div className="absolute inset-x-0 -bottom-1 h-10 bg-gradient-to-b from-transparent to-background/60 pointer-events-none" />
          <div className="container mx-auto px-5 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/45 font-medium">
                Classes & Workshops
              </span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-medium text-foreground">
                Find Your Practice
              </h1>
              <p className="mt-6 font-body text-base text-muted-foreground leading-loose">
                All levels welcome. In-person classes at {siteLocation.addressLine}.
              </p>
            </div>
          </div>
        </section>

        {/* Class Listings */}
        <section className="py-14 lg:py-16">
          <div className="container mx-auto px-5 lg:px-8">
            {isLoading ? (
              <div className="text-center py-16">
                <p className="font-body text-lg text-muted-foreground">
                  Loading classes...
                </p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {sessions.map((sessionItem) => (
                  <ClassCard 
                    key={sessionItem.id} 
                    classItem={sessionItem} 
                    onBook={handleBook}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-body text-lg text-muted-foreground mb-4">
                  No classes scheduled yet.
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  Check back soon for new sessions.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="relative py-16 lg:py-20 bg-sage-section overflow-hidden">
          <div className="absolute inset-x-0 -top-1 h-10 bg-gradient-to-b from-background/45 to-transparent pointer-events-none" />
          <div className="container mx-auto px-5 lg:px-8">
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
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
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal 
        classItem={selectedSession}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Classes;
