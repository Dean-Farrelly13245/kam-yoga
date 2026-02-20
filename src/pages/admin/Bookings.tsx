import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import AdminGuard from "@/components/admin/AdminGuard";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Ban, Filter, RefreshCw, RotateCcw } from "lucide-react";

type BookingStatus = "pending" | "paid" | "cancelled" | "refunded";

interface BookingRow {
  id: string;
  class_title: string;
  class_date: string;
  user_email: string;
  user_name: string | null;
  status: BookingStatus;
  amount_cents: number | null;
  currency: string | null;
  created_at: string;
}

const statusColors: Record<BookingStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-rose-100 text-rose-800",
  refunded: "bg-blue-100 text-blue-800",
};

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [actionTarget, setActionTarget] = useState<{ id: string; action: "cancel" | "refund" } | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    void loadBookings("all", "", "");
  }, []);

  const loadBookings = async (
    status: "all" | BookingStatus,
    from: string,
    to: string
  ) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("bookings")
        .select("id, class_id, user_email, user_name, status, amount_cents, currency, created_at, classes(title, starts_at)")
        .order("created_at", { ascending: false });

      if (status !== "all") {
        query = query.eq("status", status);
      }
      if (from) {
        query = query.gte("created_at", new Date(from).toISOString());
      }
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped: BookingRow[] = (data || []).map((row: any) => ({
        id: row.id,
        class_title: row.classes?.title || "Yoga Class",
        class_date: row.classes?.starts_at,
        user_email: row.user_email,
        user_name: row.user_name,
        status: row.status,
        amount_cents: row.amount_cents,
        currency: row.currency,
        created_at: row.created_at,
      }));

      setBookings(mapped);
    } catch (error: any) {
      console.error("Failed to load bookings", error);
      toast({
        title: "Unable to load bookings",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    void loadBookings(statusFilter, dateFrom, dateTo);
  };

  const handleReset = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    void loadBookings("all", "", "");
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setIsMutating(true);
    const newStatus = actionTarget.action === "cancel" ? "cancelled" : "refunded";

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", actionTarget.id);

      if (error) throw error;

      toast({
        title: newStatus === "cancelled" ? "Booking cancelled" : "Booking marked as refunded",
      });
      void loadBookings(statusFilter, dateFrom, dateTo);
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
      setActionTarget(null);
    }
  };

  const filteredTotals = useMemo(() => {
    const totals: Record<BookingStatus, number> = {
      paid: 0,
      pending: 0,
      cancelled: 0,
      refunded: 0,
    };
    bookings.forEach((b) => {
      totals[b.status] += 1;
    });
    return totals;
  }, [bookings]);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-3xl text-foreground">Bookings</h1>
                <p className="font-body text-muted-foreground">
                  Paid bookings count towards capacity. Pending are not yet confirmed.
                </p>
              </div>
            </div>
            <Button onClick={() => loadBookings(statusFilter, dateFrom, dateTo)} variant="outline" className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="flex items-center gap-2 font-body text-sm text-foreground">
                  <Filter className="h-4 w-4" />
                  Status
                </Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full mt-2 rounded-xl border border-border bg-background p-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dateFrom">Date from</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Date to</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl" onClick={handleApply}>
                  Apply
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            {(["paid", "pending", "cancelled", "refunded"] as BookingStatus[]).map((status) => (
              <div key={status} className="bg-card border border-border rounded-2xl p-4">
                <p className="font-body text-sm text-muted-foreground capitalize">{status}</p>
                <p className="font-heading text-2xl text-foreground">{filteredTotals[status]}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Booked At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-heading text-sm text-foreground">{booking.class_title}</div>
                        <div className="font-body text-xs text-muted-foreground">
                          {booking.class_date ? format(new Date(booking.class_date), "d MMM yyyy, HH:mm") : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-heading text-sm text-foreground">{booking.user_email}</div>
                        {booking.user_name && (
                          <div className="font-body text-xs text-muted-foreground">{booking.user_name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[booking.status]} capitalize`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.amount_cents != null ? (
                          <span className="font-heading text-sm text-foreground">
                            €{(booking.amount_cents / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground">
                        {format(new Date(booking.created_at), "d MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(booking.status === "paid" || booking.status === "pending") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-destructive text-xs h-7 px-2"
                              onClick={() => setActionTarget({ id: booking.id, action: "cancel" })}
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                          {booking.status === "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-blue-600 text-xs h-7 px-2"
                              onClick={() => setActionTarget({ id: booking.id, action: "refund" })}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Cancel / Refund confirmation dialog */}
      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === "cancel" ? "Cancel this booking?" : "Mark as refunded?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget?.action === "cancel"
                ? "The booking will be marked as cancelled. The customer will no longer hold a spot in this class."
                : "This marks the booking as refunded in the system. Make sure you have already processed the refund through Stripe before confirming."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={`rounded-xl ${actionTarget?.action === "cancel"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              onClick={handleAction}
              disabled={isMutating}
            >
              {actionTarget?.action === "cancel" ? "Cancel Booking" : "Confirm Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  );
};

export default AdminBookings;
