import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { XCircle, Calendar, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface BookingDetails {
  booking_id: string;
  class_title: string;
  starts_at: string;
  ends_at: string;
  status: string;
}

const BookingCancelled = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cancelBooking = async () => {
      if (!bookingId) {
        setIsLoading(false);
        return;
      }
      try {
        await supabase.rpc("cancel_pending_booking", { p_booking_id: bookingId });
        const { data } = await supabase.rpc("get_booking_public_by_id", { p_booking_id: bookingId });
        const record = Array.isArray(data) ? data[0] : null;
        if (record) {
          setBooking({
            booking_id: record.booking_id,
            class_title: record.class_title,
            starts_at: record.starts_at,
            ends_at: record.ends_at,
            status: record.status,
          });
        }
      } catch (error) {
        console.error("Failed to cancel booking", error);
      } finally {
        setIsLoading(false);
      }
    };

    void cancelBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <XCircle className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-4">
                Payment Cancelled
              </h1>
              
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
                Your payment was cancelled. No charges have been made. You can try again anytime.
              </p>

              {isLoading && (
                <p className="font-body text-muted-foreground mb-6">Updating your booking...</p>
              )}

              {booking && (
                <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3 mb-8">
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-xl text-foreground">{booking.class_title}</p>
                    <span className="text-xs px-2 py-1 rounded-full border border-border capitalize">
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(new Date(booking.starts_at), "EEEE, d MMM yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        {format(new Date(booking.starts_at), "HH:mm")} - {format(new Date(booking.ends_at), "HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="rounded-xl">
                  <Link to="/classes">Back to Classes</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookingCancelled;
