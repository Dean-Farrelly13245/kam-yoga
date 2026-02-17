import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, XCircle, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { siteLocation } from "@/config/site";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BookingData {
  booking_id: string;
  class_id: string;
  class_title: string;
  class_description: string | null;
  starts_at: string;
  ends_at: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  created_at: string;
}

const BookingManage = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!token) {
        setError("Invalid booking link");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: rpcError } = await supabase.rpc("get_booking_by_token", {
          p_token: token,
        });

        if (rpcError) throw rpcError;

        const record = Array.isArray(data) ? data[0] : data;
        if (!record) {
          setError("Booking not found");
        } else {
          setBooking(record as BookingData);
        }
      } catch (err: any) {
        console.error("Error loading booking:", err);
        setError("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [token]);

  const handleCancelBooking = async () => {
    if (!token) return;

    setIsCancelling(true);
    try {
      const { data, error } = await supabase.rpc("cancel_booking_by_token", {
        p_token: token,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel booking");
      }

      toast({
        title: "Booking cancelled",
        description: result.message || "Your booking has been cancelled.",
      });

      // Reload booking to show updated status
      const { data: updatedData, error: loadError } = await supabase.rpc("get_booking_by_token", {
        p_token: token,
      });

      if (!loadError) {
        const record = Array.isArray(updatedData) ? updatedData[0] : updatedData;
        if (record) {
          setBooking(record as BookingData);
        }
      }
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Failed to cancel booking",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "refunded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <section className="py-20 lg:py-28">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="font-body text-lg text-muted-foreground">Loading your booking...</p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <section className="py-20 lg:py-28">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-destructive/10 p-4">
                    <AlertCircle className="h-16 w-16 text-destructive" />
                  </div>
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl font-light text-foreground mb-4">
                  Booking Not Found
                </h1>
                <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
                  {error || "We couldn't find this booking. The link may be invalid or expired."}
                </p>
                <Button asChild className="rounded-xl">
                  <Link to="/classes">Browse Classes</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const startDate = new Date(booking.starts_at);
  const endDate = new Date(booking.ends_at);
  const isPast = startDate < new Date();
  const canCancel = booking.status === "pending" && !isPast;
  const amount = (booking.amount_cents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
                  Manage Booking
                </span>
                <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-light text-foreground">
                  Your Booking Details
                </h1>
              </div>

              {/* Booking Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-2xl text-foreground mb-3">
                      {booking.class_title}
                    </h2>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-3xl text-foreground">€{amount}</div>
                    {isPast && (
                      <span className="text-xs text-muted-foreground">Past class</span>
                    )}
                  </div>
                </div>

                {/* Class Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide">
                        Date
                      </p>
                      <p className="font-body text-foreground">
                        {format(startDate, "EEEE, d MMMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide">
                        Time
                      </p>
                      <p className="font-body text-foreground">
                        {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground sm:col-span-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide">
                        Location
                      </p>
                      <p className="font-body text-foreground">
                        {siteLocation.addressLine}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {booking.class_description && (
                  <div className="border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground font-body">
                      {booking.class_description}
                    </p>
                  </div>
                )}

                {/* Booking Info */}
                <div className="border-t border-border pt-6">
                  <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Booking Information
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="font-body text-foreground">
                      <span className="text-muted-foreground">Name:</span> {booking.user_name || "Not provided"}
                    </p>
                    <p className="font-body text-foreground">
                      <span className="text-muted-foreground">Email:</span> {booking.user_email}
                    </p>
                    {booking.user_phone && (
                      <p className="font-body text-foreground">
                        <span className="text-muted-foreground">Phone:</span> {booking.user_phone}
                      </p>
                    )}
                    <p className="font-body text-foreground">
                      <span className="text-muted-foreground">Booked on:</span>{" "}
                      {format(new Date(booking.created_at), "d MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border pt-6 space-y-4">
                  {canCancel ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-destructive hover:bg-destructive/10"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={isCancelling}
                    >
                      Cancel Booking
                    </Button>
                  ) : booking.status === "paid" && !isPast ? (
                    <div className="bg-sage-light/40 border border-border rounded-xl p-4 text-sm text-muted-foreground">
                      To cancel a paid booking, please contact us at least 24 hours before the class.
                    </div>
                  ) : booking.status === "cancelled" ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">
                      This booking has been cancelled.
                    </div>
                  ) : null}

                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
                    <p className="font-medium mb-2">Want to manage all your bookings?</p>
                    <p className="text-muted-foreground mb-3">
                      Create an account to view all your bookings in one place and get booking updates.
                    </p>
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link to="/bookings">Create Account / Sign In</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="mt-8 text-center">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/classes">Browse More Classes</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your pending booking. No charges have been made yet. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={isCancelling}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingManage;
