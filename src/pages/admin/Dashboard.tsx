import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, LogOut, Euro, TrendingUp, Home, ClipboardList } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [revenueStats, setRevenueStats] = useState<{ week: number; month: number; year: number }>({
    week: 0,
    month: 0,
    year: 0,
  });
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);

  useEffect(() => {
    loadRevenueStats();
  }, []);

  const loadRevenueStats = async () => {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const { data, error } = await supabase
        .from("payments")
        .select("amount_cents, currency, status, created_at")
        .eq("status", "succeeded");

      if (error) throw error;

      const payments = data || [];
      const weekRevenue =
        payments
          .filter((p: any) => new Date(p.created_at) >= weekStart)
          .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0) / 100;
      const monthRevenue =
        payments
          .filter((p: any) => new Date(p.created_at) >= monthStart)
          .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0) / 100;
      const yearRevenue =
        payments
          .filter((p: any) => new Date(p.created_at) >= yearStart)
          .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0) / 100;

      setRevenueStats({
        week: weekRevenue,
        month: monthRevenue,
        year: yearRevenue,
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
                  to="/admin/bookings"
                  className="group bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-sage-light group-hover:bg-primary/20 transition-colors">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-medium text-foreground">
                      Bookings
                    </h2>
                  </div>
                  <p className="font-body text-muted-foreground">
                    View paid bookings and statuses
                  </p>
                </Link>

                <Link
                  to="/admin/analytics"
                  className="group bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-sage-light group-hover:bg-primary/20 transition-colors">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-medium text-foreground">
                      Analytics
                    </h2>
                  </div>
                  <p className="font-body text-muted-foreground">
                    Revenue metrics based on Stripe payments
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

