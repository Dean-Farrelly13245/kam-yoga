import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Calendar, Mail, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface BookingDetails {
  booking_id: string;
  class_title: string;
  starts_at: string;
  ends_at: string;
  amount_cents: number;
  currency: string;
  status: string;
  user_email: string;
  user_name: string | null;
}

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollCountRef = useRef(0);
  const [isPolling, setIsPolling] = useState(false);
  const [manageToken, setManageToken] = useState<string | null>(null);

  // Try to get manage_token from URL or sessionStorage
  useEffect(() => {
    const tokenFromUrl = searchParams.get("manage_token");
    if (tokenFromUrl) {
      setManageToken(tokenFromUrl);
    } else if (bookingId) {
      const tokenFromStorage = sessionStorage.getItem(`booking_${bookingId}_token`);
      if (tokenFromStorage) {
        setManageToken(tokenFromStorage);
        // Clean up sessionStorage
        sessionStorage.removeItem(`booking_${bookingId}_token`);
      }
    }
  }, [searchParams, bookingId]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!sessionId && !bookingId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error: rpcError } = sessionId
          ? await supabase.rpc("get_booking_public", { p_checkout_session_id: sessionId })
          : await supabase.rpc("get_booking_public_by_id", { p_booking_id: bookingId });

        if (rpcError) throw rpcError;
        const record = Array.isArray(data) ? data[0] : null;
        if (record) {
          setBooking({
            booking_id: record.booking_id,
            class_title: record.class_title,
            starts_at: record.starts_at,
            ends_at: record.ends_at,
            amount_cents: record.amount_cents,
            currency: record.currency,
            status: record.status,
            user_email: record.user_email,
            user_name: record.user_name,
          });
        } else {
          setBooking(null);
        }
      } catch (err: any) {
        console.error("Failed to load booking", err);
        setError("We couldn't find your booking details, but your payment was received.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBooking();
  }, [sessionId, bookingId]);

  const isPaid = booking?.status === "paid";
  const isCancelled = booking?.status === "cancelled";
  const amount = booking ? (booking.amount_cents || 0) / 100 : null;
  const isPending = booking?.status === "pending";

  useEffect(() => {
    pollCountRef.current = 0;
  }, [sessionId, bookingId]);

  useEffect(() => {
    if (!sessionId && !bookingId) return;
    if (!isPending) {
      setIsPolling(false);
      return;
    }
    setIsPolling(true);
    if (pollCountRef.current >= 10) {
      setIsPolling(false);
      return;
    }
    const timer = setTimeout(async () => {
      pollCountRef.current += 1;
      const { data, error: rpcError } = sessionId
        ? await supabase.rpc("get_booking_public", { p_checkout_session_id: sessionId })
        : await supabase.rpc("get_booking_public_by_id", { p_booking_id: bookingId });
      if (!rpcError && Array.isArray(data) && data[0]) {
        setBooking((prev) => ({
          booking_id: data[0].booking_id,
          class_title: data[0].class_title,
          starts_at: data[0].starts_at,
          ends_at: data[0].ends_at,
          amount_cents: data[0].amount_cents,
          currency: data[0].currency,
          status: data[0].status,
          user_email: data[0].user_email,
          user_name: data[0].user_name,
        }));
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isPending, sessionId, bookingId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-4">
                {isPaid ? "Booking Confirmed" : isCancelled ? "Booking Cancelled" : "Payment Received"}
              </h1>
              
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
                {isPaid
                  ? "You're all set. We've confirmed your spot for this class."
                  : isCancelled
                  ? "This booking was cancelled (likely due to capacity limits). If you were charged, we'll review and follow up."
                  : "Thanks for your payment. Your booking will be confirmed once the payment is finalised."}
              </p>

              {isLoading && (
                <p className="font-body text-muted-foreground mb-8">Loading your booking details...</p>
              )}

              {error && (
                <p className="font-body text-sm text-destructive mb-8">{error}</p>
              )}

              {booking && (
                <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4 mb-10">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <p className="font-heading text-xl text-foreground">{booking.class_title}</p>
                      <p className="font-body text-sm text-muted-foreground capitalize">Status: {booking.status}</p>
                    </div>
                    {amount !== null && (
                      <div className="font-heading text-2xl text-foreground">
                        €{amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {isPending && (
                    <p className="font-body text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      Payment received, confirming your booking... {isPolling ? "Checking..." : ""}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                        <p className="font-body text-foreground">
                          {format(new Date(booking.starts_at), "EEEE, d MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                        <p className="font-body text-foreground">
                          {format(new Date(booking.starts_at), "HH:mm")} - {format(new Date(booking.ends_at), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                      <p className="font-body text-foreground">{booking.user_email}</p>
                      {booking.user_name && (
                        <p className="font-body text-muted-foreground text-sm">Booked by {booking.user_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button asChild className="rounded-xl">
                    <Link to="/bookings">View My Bookings</Link>
                  </Button>
                ) : manageToken ? (
                  <Button asChild className="rounded-xl">
                    <Link to={`/booking/manage/${manageToken}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage This Booking
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/classes">View More Classes</Link>
                </Button>
                {!user && (
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link to="/bookings">Create Account</Link>
                  </Button>
                )}
              </div>

              {!user && manageToken && (
                <div className="mt-8 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm text-foreground">
                  <p className="font-medium mb-2">Save this link to manage your booking:</p>
                  <div className="bg-background rounded-lg p-3 font-mono text-xs break-all">
                    {window.location.origin}/booking/manage/{manageToken}
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Or <Link to="/bookings" className="text-primary hover:underline">create an account</Link> to view all your bookings in one place.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookingSuccess;
