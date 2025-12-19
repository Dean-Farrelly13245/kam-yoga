import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, LogOut, LayoutDashboard, Euro, TrendingUp, Home } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface RevenueStats {
  week: number;
  month: number;
  year: number;
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);

  useEffect(() => {
    loadRevenueStats();
  }, []);

  const loadRevenueStats = async () => {
    try {
      // Get current date boundaries
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      // Get revenue for week
      const { data: weekData, error: weekError } = await supabase
        .from("bookings")
        .select("amount_eur")
        .eq("status", "paid")
        .gte("paid_at", weekStart.toISOString());

      // Get revenue for month
      const { data: monthData, error: monthError } = await supabase
        .from("bookings")
        .select("amount_eur")
        .eq("status", "paid")
        .gte("paid_at", monthStart.toISOString());

      // Get revenue for year
      const { data: yearData, error: yearError } = await supabase
        .from("bookings")
        .select("amount_eur")
        .eq("status", "paid")
        .gte("paid_at", yearStart.toISOString());

      // Get all paid bookings for monthly breakdown (last 12 months)
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 12);

      const { data: allData, error: allError } = await supabase
        .from("bookings")
        .select("amount_eur, paid_at")
        .eq("status", "paid")
        .gte("paid_at", twelveMonthsAgo.toISOString())
        .not("paid_at", "is", null);

      if (weekError || monthError || yearError || allError) {
        throw weekError || monthError || yearError || allError;
      }

      const weekRevenue = weekData?.reduce((sum, b) => sum + (b.amount_eur || 0), 0) || 0;
      const monthRevenue = monthData?.reduce((sum, b) => sum + (b.amount_eur || 0), 0) || 0;
      const yearRevenue = yearData?.reduce((sum, b) => sum + (b.amount_eur || 0), 0) || 0;

      // Group by month
      const monthlyMap = new Map<string, number>();
      allData?.forEach((booking) => {
        if (booking.paid_at) {
          const date = new Date(booking.paid_at);
          const monthKey = format(date, "yyyy-MM");
          const current = monthlyMap.get(monthKey) || 0;
          monthlyMap.set(monthKey, current + (booking.amount_eur || 0));
        }
      });

      // Convert to array and sort
      const monthlyBreakdown = Array.from(monthlyMap.entries())
        .map(([month, revenue]) => ({
          month: format(new Date(month + "-01"), "MMM yyyy"),
          revenue,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      setRevenueStats({
        week: weekRevenue,
        month: monthRevenue,
        year: yearRevenue,
        monthlyBreakdown,
      });
    } catch (error: any) {
      console.error("Error loading revenue stats:", error);
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-3xl font-medium text-foreground">
                  Admin Dashboard
                </h1>
                <p className="font-body text-muted-foreground mt-2">
                  Manage classes and blog posts
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  asChild
                  className="rounded-xl"
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Return to Site
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="rounded-xl"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Revenue KPIs */}
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-medium text-foreground mb-4">
                Revenue Overview
              </h2>
              {isLoadingRevenue ? (
                <p className="font-body text-muted-foreground">Loading revenue data...</p>
              ) : revenueStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Euro className="h-5 w-5 text-primary" />
                      <span className="font-body text-sm text-muted-foreground">This Week</span>
                    </div>
                    <p className="font-heading text-3xl font-medium text-foreground">
                      €{revenueStats.week.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="font-body text-sm text-muted-foreground">This Month</span>
                    </div>
                    <p className="font-heading text-3xl font-medium text-foreground">
                      €{revenueStats.month.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Euro className="h-5 w-5 text-primary" />
                      <span className="font-body text-sm text-muted-foreground">This Year</span>
                    </div>
                    <p className="font-heading text-3xl font-medium text-foreground">
                      €{revenueStats.year.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="font-body text-muted-foreground">No revenue data available</p>
              )}

              {/* Monthly Breakdown */}
              {revenueStats && revenueStats.monthlyBreakdown.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-heading text-xl font-medium text-foreground mb-4">
                    Monthly Breakdown (Last 12 Months)
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueStats.monthlyBreakdown.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.month}</TableCell>
                            <TableCell className="text-right font-medium">
                              €{item.revenue.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="font-heading text-2xl font-medium text-foreground mb-4">
                Quick Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  to="/admin/classes"
                  className="group bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-sage-light group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-medium text-foreground">
                      Classes
                    </h2>
                  </div>
                  <p className="font-body text-muted-foreground">
                    Create, edit, and manage yoga classes
                  </p>
                </Link>

                <Link
                  to="/admin/blog"
                  className="group bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-sage-light group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-medium text-foreground">
                      Blog Posts
                    </h2>
                  </div>
                  <p className="font-body text-muted-foreground">
                    Write and publish blog posts
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default Dashboard;

