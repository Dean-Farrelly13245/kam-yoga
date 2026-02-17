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
import { ArrowLeft, Filter, RefreshCw } from "lucide-react";

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

  useEffect(() => {
    void loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("bookings")
        .select("id, class_id, user_email, user_name, status, amount_cents, currency, created_at, classes(title, starts_at)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (dateFrom) {
        query = query.gte("created_at", new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        const end = new Date(dateTo);
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
            <Button onClick={loadBookings} variant="outline" className="rounded-xl">
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
                <Button className="flex-1 rounded-xl" onClick={loadBookings}>
                  Apply
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFrom("");
                    setDateTo("");
                    void loadBookings();
                  }}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminBookings;
