import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingModal from "@/components/classes/BookingModal";
import { supabase, PublishedSession } from "@/lib/supabaseClient";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { siteLocation } from "@/config/site";

const ClassSessionPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState<PublishedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc("get_published_classes");
      if (error) throw error;
      const match = (data || []).find((item: any) => item.id === id);
      if (match) {
        const remaining =
          match.capacity !== null && match.paid_count !== null
            ? Math.max(match.capacity - match.paid_count, 0)
            : null;
        setSession({
          id: match.id,
          title: match.title,
          description: match.description,
          starts_at: match.starts_at,
          ends_at: match.ends_at,
          price_cents: match.price_cents,
          currency: match.currency || "eur",
          capacity: match.capacity,
          is_active: match.is_active,
          created_at: match.created_at,
          paid_count: match.paid_count,
          remaining_spots: remaining,
        });
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Error loading session", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const start = session ? new Date(session.starts_at) : null;
  const end = session ? new Date(session.ends_at) : null;
  const remaining = session?.capacity != null && session.remaining_spots != null
    ? Math.max(session.remaining_spots, 0)
    : null;

  const ctaDisabled = useMemo(() => {
    if (!session || !start) return true;
    const isPast = start < new Date();
    const full = remaining !== null && remaining <= 0;
    return isPast || full;
  }, [session, start, remaining]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="py-14">
          <div className="container mx-auto px-6 lg:px-8">
            {isLoading ? (
              <p className="font-body text-muted-foreground">Loading...</p>
            ) : !session ? (
              <div className="text-center py-16">
                <h1 className="font-heading text-3xl text-foreground mb-3">Session not found</h1>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/classes">Back to classes</Link>
                </Button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <p className="font-body text-sm uppercase tracking-widest text-primary">All levels welcome</p>
                    <h1 className="font-heading text-4xl text-foreground">{session.title}</h1>
                    {session.description && (
                      <p className="font-body text-lg text-muted-foreground leading-relaxed">
                        {session.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-card border border-border/60 rounded-xl p-4">
                      <Calendar className="text-primary" />
                      <div>
                        <p className="font-heading text-sm text-muted-foreground">Date</p>
                        <p className="font-body text-foreground">{start ? format(start, "EEEE, d MMMM yyyy") : "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-card border border-border/60 rounded-xl p-4">
                      <Clock className="text-primary" />
                      <div>
                        <p className="font-heading text-sm text-muted-foreground">Time</p>
                        <p className="font-body text-foreground">
                          {start && end ? `${format(start, "HH:mm")} - ${format(end, "HH:mm")}` : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-card border border-border/60 rounded-xl p-4">
                      <MapPin className="text-primary" />
                      <div>
                        <p className="font-heading text-sm text-muted-foreground">Location</p>
                        <p className="font-body text-foreground">{siteLocation.addressLine}</p>
                        <p className="font-body text-sm text-muted-foreground">
                          In-person at {siteLocation.studioName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-card border border-border/60 rounded-xl p-4">
                      <div className="text-primary font-heading text-xl">€{(session.price_cents / 100).toFixed(2)}</div>
                      <div>
                        <p className="font-heading text-sm text-muted-foreground">Investment</p>
                        <p className="font-body text-foreground">
                          {remaining !== null ? `${remaining} spots left` : "Open capacity"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {session.notes && (
                    <div className="bg-card border border-border/60 rounded-xl p-4">
                      <h3 className="font-heading text-lg text-foreground mb-2">Notes</h3>
                      <p className="font-body text-muted-foreground whitespace-pre-line">{session.notes}</p>
                    </div>
                  )}

                  <div className="bg-card border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-heading text-sm text-muted-foreground">Studio location</p>
                      <p className="font-body text-foreground">{siteLocation.addressLine}</p>
                      <p className="font-body text-sm text-muted-foreground">All classes are in person.</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl">
                      <a href={siteLocation.googleMapsUrl} target="_blank" rel="noreferrer">
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="rounded-xl"
                      onClick={() => setIsModalOpen(true)}
                      disabled={ctaDisabled}
                    >
                      {ctaDisabled ? "No spots available" : "Book & Pay"}
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link to="/classes">Back to classes</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <BookingModal
        classItem={session}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ClassSessionPage;
