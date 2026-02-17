import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/admin/AdminGuard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, RefreshCw, TrendingUp, Wallet, CalendarRange } from "lucide-react";

interface PaymentRow {
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  booking?: {
    class_id?: string;
    classes?: {
      title?: string;
    } | null;
  } | null;
}

const Analytics = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("amount_cents, currency, status, created_at, booking:booking_id ( class_id, classes(title) )")
        .eq("status", "succeeded")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error("Failed to load analytics", error);
      toast({
        title: "Unable to load analytics",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    let total = 0;
    let week = 0;
    let month = 0;
    const perClass = new Map<string, number>();

    payments.forEach((p) => {
      const amount = (p.amount_cents || 0) / 100;
      total += amount;
      const created = new Date(p.created_at);
      if (created >= weekStart) week += amount;
      if (created >= monthStart) month += amount;

      const classTitle = p.booking?.classes?.title || "Unknown class";
      perClass.set(classTitle, (perClass.get(classTitle) || 0) + amount);
    });

    return {
      total,
      week,
      month,
      perClass: Array.from(perClass.entries()).map(([title, revenue]) => ({ title, revenue })),
    };
  }, [payments]);

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
                <h1 className="font-heading text-3xl text-foreground">Revenue Analytics</h1>
                <p className="font-body text-muted-foreground">
                  Payments are the source of truth for revenue metrics.
                </p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl" onClick={loadAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Wallet className="h-4 w-4 text-primary" />
                Total revenue
              </div>
              <p className="font-heading text-3xl text-foreground">€{totals.total.toFixed(2)}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                This week
              </div>
              <p className="font-heading text-3xl text-foreground">€{totals.week.toFixed(2)}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CalendarRange className="h-4 w-4 text-primary" />
                This month
              </div>
              <p className="font-heading text-3xl text-foreground">€{totals.month.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl text-foreground">Revenue per class</h2>
              <span className="text-sm text-muted-foreground">
                {payments.length} successful payment{payments.length === 1 ? "" : "s"}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : totals.perClass.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No paid bookings yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  totals.perClass.map((item) => (
                    <TableRow key={item.title}>
                      <TableCell className="font-heading text-sm text-foreground">{item.title}</TableCell>
                      <TableCell className="text-right font-heading text-sm text-foreground">
                        €{item.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl text-foreground">Recent payments</h2>
              <span className="text-sm text-muted-foreground">
                Latest {Math.min(payments.length, 10)} of {payments.length}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No payments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.slice(0, 10).map((payment, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-heading text-sm text-foreground">
                        {payment.booking?.classes?.title || "Unknown class"}
                      </TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground capitalize">
                        {payment.status}
                      </TableCell>
                      <TableCell className="font-heading text-sm text-foreground">
                        €{((payment.amount_cents || 0) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), "d MMM yyyy, HH:mm")}
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

export default Analytics;
