import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, XCircle, CheckCircle2, Loader2, LogOut } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { siteLocation } from "@/config/site";
import MagicLinkAuth from "@/components/auth/MagicLinkAuth";
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
  paid_at: string | null;
}

const MyBookings = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [claimedCount, setClaimedCount] = useState<number | null>(null);

  // Claim guest bookings and load user bookings when authenticated
  useEffect(() => {
    if (!user) return;

    const claimAndLoadBookings = async () => {
      setIsLoading(true);
      try {
        // First, claim any guest bookings with matching email
        const { data: claimed, error: claimError } = await supabase.rpc("claim_my_bookings");
        
        if (claimError) {
          console.error("Error claiming bookings:", claimError);
        } else if (claimed && claimed > 0) {
          setClaimedCount(claimed);
          toast({
            title: "Bookings claimed",
            description: `We found ${claimed} previous booking${claimed > 1 ? 's' : ''} and linked them to your account.`,
          });
        }

        // Load user's bookings
        const { data, error } = await supabase.rpc("get_my_bookings");

        if (error) throw error;

        setBookings((data || []) as BookingData[]);
      } catch (error: any) {
        console.error("Error loading bookings:", error);
        toast({
          title: "Failed to load bookings",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    claimAndLoadBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { data, error } = await supabase.rpc("cancel_my_booking", {
        p_booking_id: bookingId,
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

      // Reload bookings
      const { data: updatedBookings, error: loadError } = await supabase.rpc("get_my_bookings");
      if (!loadError) {
        setBookings((updatedBookings || []) as BookingData[]);
      }
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Failed to cancel booking",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setBookings([]);
    setClaimedCount(null);
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <section className="py-20 lg:py-28">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="font-body text-lg text-muted-foreground">Loading...</p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-sage-light/50 to-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
                My Bookings
              </span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-light text-foreground">
                {user ? "Your Classes" : "Sign in to view your bookings"}
              </h1>
              <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed">
                {user
                  ? "View and manage your upcoming and past bookings."
                  : "Create an account or sign in to see all your bookings in one place."}
              </p>
            </div>
          </div>
        </section>

        {/* Auth or Bookings Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              {!user ? (
                <MagicLinkAuth redirectTo={`${window.location.origin}/bookings`} />
              ) : (
                <div className="space-y-6">
                  {/* User info and sign out */}
                  <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Signed in as</p>
                      <p className="font-heading text-lg text-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="rounded-xl"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>

                  {/* Claimed bookings notification */}
                  {claimedCount !== null && claimedCount > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                      <p className="font-body text-sm text-foreground">
                        ✓ We found and linked {claimedCount} previous booking{claimedCount > 1 ? 's' : ''} to your account.
                      </p>
                    </div>
                  )}

                  {/* Bookings list */}
                  {isLoading ? (
                    <div className="text-center py-16">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="font-body text-lg text-muted-foreground">Loading your bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-16 bg-card border border-border rounded-2xl">
                      <p className="font-body text-lg text-muted-foreground mb-4">
                        No bookings found.
                      </p>
                      <p className="font-body text-sm text-muted-foreground mb-6">
                        Book your first class to get started!
                      </p>
                      <Button asChild className="rounded-xl">
                        <a href="/classes">Browse Classes</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h2 className="font-heading text-2xl font-medium text-foreground">
                        Your Bookings ({bookings.length})
                      </h2>
                      {bookings.map((booking) => {
                        const startDate = new Date(booking.starts_at);
                        const endDate = new Date(booking.ends_at);
                        const isPast = startDate < new Date();
                        const canCancel = booking.status === "pending" && !isPast;
                        const amount = (booking.amount_cents / 100).toFixed(2);

                        return (
                          <div
                            key={booking.booking_id}
                            className="bg-card border border-border rounded-2xl p-6 shadow-soft"
                          >
                            <div className="flex flex-col gap-4">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-heading text-xl text-foreground mb-2">
                                    {booking.class_title}
                                  </h3>
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
                                  <div className="font-heading text-2xl text-foreground">
                                    €{amount}
                                  </div>
                                  {isPast && (
                                    <span className="text-xs text-muted-foreground">
                                      Past class
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <Calendar className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-heading text-xs text-muted-foreground uppercase tracking-wide">
                                      Date
                                    </p>
                                    <p className="font-body text-foreground">
                                      {format(startDate, "EEEE, d MMM yyyy")}
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
                                <p className="text-sm text-muted-foreground font-body border-t border-border pt-4">
                                  {booking.class_description}
                                </p>
                              )}

                              {/* Actions */}
                              {canCancel && (
                                <div className="border-t border-border pt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl text-destructive hover:bg-destructive/10"
                                    onClick={() => setCancellingId(booking.booking_id)}
                                  >
                                    Cancel Booking
                                  </Button>
                                </div>
                              )}

                              {booking.status === "paid" && !isPast && (
                                <div className="bg-sage-light/40 border border-border rounded-xl p-3 text-sm text-muted-foreground">
                                  To cancel a paid booking, please contact us at least 24
                                  hours before the class.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={!!cancellingId}
        onOpenChange={(open) => !open && setCancellingId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your pending booking. No charges have been made yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={() => cancellingId && handleCancelBooking(cancellingId)}
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookings;
