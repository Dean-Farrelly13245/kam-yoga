import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase, Class } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, MapPin, Euro, Users, ChevronDown, ChevronUp, Download, Copy } from "lucide-react";
import { Booking } from "@/lib/supabaseClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassWithStats extends Class {
  bookedCount: number;
  totalRevenue: number;
  spotsLeft: number | null;
  isUpcoming: boolean;
}

type FilterType = "upcoming" | "past" | "all";

// Date formatting helpers using Intl.DateTimeFormat with en-IE locale
const fmtDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
};

const fmtDateTime = (isoStr: string): string => {
  return new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoStr));
};

const AdminClasses = () => {
  const [classes, setClasses] = useState<ClassWithStats[]>([]);
  const [filter, setFilter] = useState<FilterType>("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [classBookings, setClassBookings] = useState<Record<string, Booking[]>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    price_eur: "",
    capacity: "",
    is_published: false,
  });

  useEffect(() => {
    loadClasses();
  }, []);

  // Helper function to determine if a class is upcoming
  // Uses end_time if it exists, otherwise start_time
  const isClassUpcoming = (classItem: Class): boolean => {
    const now = new Date();
    const timeToUse = classItem.end_time || classItem.start_time;
    const classDateTime = new Date(`${classItem.date}T${timeToUse}`);
    return classDateTime >= now;
  };

  const loadClasses = async () => {
    try {
      // Fetch all classes in one query
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .order("date", { ascending: true });

      if (classesError) throw classesError;

      if (!classesData || classesData.length === 0) {
        setClasses([]);
        setIsLoading(false);
        return;
      }

      // Fetch all PAID bookings in one query (status='paid' means booked)
      const classIds = classesData.map((c) => c.id);
      const { data: allPaidBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("class_id, amount_eur")
        .in("class_id", classIds)
        .eq("status", "paid");

      if (bookingsError) {
        console.error("Error loading bookings:", bookingsError);
      }

      // Build a map keyed by class_id to compute bookedCount and totalRevenue
      const bookingStatsMap = new Map<string, { count: number; revenue: number }>();
      (allPaidBookings || []).forEach((booking) => {
        const existing = bookingStatsMap.get(booking.class_id) || { count: 0, revenue: 0 };
        bookingStatsMap.set(booking.class_id, {
          count: existing.count + 1,
          revenue: existing.revenue + (booking.amount_eur || 0),
        });
      });

      // Build classes with stats
      const classesWithStats: ClassWithStats[] = classesData.map((classItem) => {
        const stats = bookingStatsMap.get(classItem.id) || { count: 0, revenue: 0 };
        const bookedCount = stats.count;
        const totalRevenue = stats.revenue;
        const spotsLeft = classItem.capacity !== null 
          ? Math.max(0, classItem.capacity - bookedCount)
          : null;
        const isUpcoming = isClassUpcoming(classItem);

        return {
          ...classItem,
          bookedCount,
          totalRevenue,
          spotsLeft,
          isUpcoming,
        };
      });

      setClasses(classesWithStats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassBookings = async (classId: string) => {
    if (classBookings[classId]) {
      return; // Already loaded
    }

    try {
      // Only load paid bookings (booked), sorted by paid_at ascending
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("class_id", classId)
        .eq("status", "paid")
        .order("paid_at", { ascending: true, nullsFirst: false });

      if (error) throw error;

      setClassBookings((prev) => ({
        ...prev,
        [classId]: data || [],
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load bookings",
        variant: "destructive",
      });
    }
  };

  const handleToggleClassDetails = (classId: string) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
    } else {
      setExpandedClassId(classId);
      loadClassBookings(classId);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    // Admin safety: prevent setting status to 'paid'
    if (newStatus === "paid") {
      toast({
        title: "Error",
        description: "Cannot set booking status to 'paid'. Only Stripe webhooks can set this status.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking status updated",
      });

      // Reload classes to update stats
      loadClasses();
      
      // Reload bookings for the expanded class
      if (expandedClassId) {
        // Clear cached bookings and reload
        setClassBookings((prev) => {
          const updated = { ...prev };
          delete updated[expandedClassId];
          return updated;
        });
        loadClassBookings(expandedClassId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  const handleCreate = () => {
    setEditingClass(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      price_eur: "",
      capacity: "",
      is_published: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      title: classItem.title,
      description: classItem.description || "",
      date: classItem.date,
      start_time: classItem.start_time,
      end_time: classItem.end_time || "",
      location: classItem.location || "",
      price_eur: classItem.price_eur?.toString() || "",
      capacity: classItem.capacity?.toString() || "",
      is_published: classItem.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const classData = {
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        location: formData.location || null,
        price_eur: formData.price_eur ? parseFloat(formData.price_eur) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        is_published: formData.is_published,
      };

      if (editingClass) {
        const { error } = await supabase
          .from("classes")
          .update(classData)
          .eq("id", editingClass.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
      } else {
        const { error } = await supabase.from("classes").insert(classData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Class created successfully",
        });
      }

      setIsDialogOpen(false);
      loadClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save class",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteClassId) return;

    try {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", deleteClassId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setDeleteClassId(null);
      loadClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  // Filter classes based on selected filter
  const filteredClasses = classes.filter((classItem) => {
    if (filter === "upcoming") return classItem.isUpcoming;
    if (filter === "past") return !classItem.isUpcoming;
    return true; // "all"
  });

  // Export CSV function
  const exportAttendeesCSV = (classItem: ClassWithStats) => {
    const bookings = classBookings[classItem.id] || [];
    if (bookings.length === 0) {
      toast({
        title: "No data",
        description: "No attendees to export",
        variant: "default",
      });
      return;
    }

    // CSV header with Amount (EUR)
    const headers = ["Name", "Email", "Paid At", "Amount (EUR)"];
    const rows = bookings.map((booking) => [
      booking.name,
      booking.email,
      booking.paid_at ? fmtDateTime(booking.paid_at) : "",
      booking.amount_eur?.toFixed(2) || "0.00",
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create blob and download (with filename sanitization)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${classItem.title.replace(/[^a-z0-9]/gi, "_")}_attendees.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy emails to clipboard
  const copyEmails = (classItem: ClassWithStats) => {
    const bookings = classBookings[classItem.id] || [];
    if (bookings.length === 0) {
      toast({
        title: "No emails",
        description: "No attendees to copy emails from",
        variant: "default",
      });
      return;
    }

    const emails = bookings.map((booking) => booking.email).join(", ");
    navigator.clipboard.writeText(emails).then(() => {
      toast({
        title: "Copied",
        description: `${bookings.length} email${bookings.length > 1 ? "s" : ""} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy emails to clipboard",
        variant: "destructive",
      });
    });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-heading text-3xl font-medium text-foreground">
                    Manage Classes
                  </h1>
                  <p className="font-body text-muted-foreground mt-2">
                    Create, edit, and publish yoga classes
                  </p>
                </div>
              </div>
              <Button onClick={handleCreate} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </div>

            {/* Filter Controls */}
            {!isLoading && classes.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant={filter === "upcoming" ? "default" : "outline"}
                  onClick={() => setFilter("upcoming")}
                  className="rounded-xl"
                >
                  Upcoming
                </Button>
                <Button
                  variant={filter === "past" ? "default" : "outline"}
                  onClick={() => setFilter("past")}
                  className="rounded-xl"
                >
                  Past
                </Button>
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className="rounded-xl"
                >
                  All
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <p className="font-body text-muted-foreground">Loading...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="font-body text-muted-foreground mb-4">
                  No classes yet
                </p>
                <Button onClick={handleCreate} className="rounded-xl">
                  Create your first class
                </Button>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="font-body text-muted-foreground">
                  No {filter === "upcoming" ? "upcoming" : filter === "past" ? "past" : ""} classes found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((classItem) => (
                  <Collapsible
                    key={classItem.id}
                    open={expandedClassId === classItem.id}
                    onOpenChange={() => handleToggleClassDetails(classItem.id)}
                  >
                    <div className="bg-card rounded-2xl border border-border hover:shadow-soft transition-all">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-heading text-xl font-medium text-foreground">
                                {classItem.title}
                              </h3>
                              {classItem.is_published ? (
                                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                  Published
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                                  Draft
                                </span>
                              )}
                              {classItem.isUpcoming ? (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                  Upcoming
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                                  Past
                                </span>
                              )}
                            </div>

                            {classItem.description && (
                              <p className="font-body text-muted-foreground mb-4">
                                {classItem.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {fmtDate(classItem.date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {classItem.start_time}
                                {classItem.end_time && ` - ${classItem.end_time}`}
                              </div>
                              {classItem.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {classItem.location}
                                </div>
                              )}
                              {classItem.price_eur && (
                                <div className="flex items-center gap-2">
                                  <Euro className="h-4 w-4" />
                                  €{classItem.price_eur}
                                </div>
                              )}
                            </div>

                            {/* Booking Stats */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="font-medium text-foreground">
                                  {classItem.bookedCount} booked
                                </span>
                              </div>
                              {classItem.capacity !== null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    {classItem.spotsLeft !== null
                                      ? `${classItem.spotsLeft} spots left`
                                      : "Unlimited"}
                                  </span>
                                </div>
                              )}
                              {classItem.totalRevenue > 0 && (
                                <div className="flex items-center gap-2">
                                  <Euro className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-foreground">
                                    €{classItem.totalRevenue.toFixed(2)} revenue
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="rounded-xl"
                              >
                                {expandedClassId === classItem.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(classItem)}
                              className="rounded-xl"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setDeleteClassId(classItem.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="rounded-xl text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <CollapsibleContent>
                        <div className="px-6 pb-6 border-t border-border">
                          {/* Class Details Section */}
                          <div className="mt-6 mb-6">
                            <h4 className="font-heading text-lg font-medium text-foreground mb-4">
                              Class Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Title:</span>
                                <p className="font-medium text-foreground mt-1">{classItem.title}</p>
                              </div>
                              {classItem.description && (
                                <div className="md:col-span-2">
                                  <span className="text-muted-foreground">Description:</span>
                                  <p className="font-medium text-foreground mt-1">{classItem.description}</p>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <p className="font-medium text-foreground mt-1">
                                  {fmtDate(classItem.date)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Time:</span>
                                <p className="font-medium text-foreground mt-1">
                                  {classItem.start_time}
                                  {classItem.end_time ? ` - ${classItem.end_time}` : " (End time not set)"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Location:</span>
                                <p className="font-medium text-foreground mt-1">
                                  {classItem.location || "Location not set"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <p className="font-medium text-foreground mt-1">
                                  {classItem.price_eur ? `€${classItem.price_eur.toFixed(2)}` : "Not set"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>
                                <p className="font-medium text-foreground mt-1">
                                  {classItem.capacity !== null ? classItem.capacity : "No capacity limit"}
                                </p>
                              </div>
                              {classItem.booking_url && (
                                <div className="md:col-span-2">
                                  <span className="text-muted-foreground">Booking URL:</span>
                                  <p className="font-medium text-foreground mt-1">
                                    <a
                                      href={classItem.booking_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {classItem.booking_url}
                                    </a>
                                  </p>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Published Status:</span>
                                <p className="font-medium text-foreground mt-1">
                                  {classItem.is_published ? "Published" : "Draft"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <p className="font-medium text-foreground mt-1">
                                  {classItem.isUpcoming ? "Upcoming" : "Past"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Booking Summary */}
                          <div className="mb-6 pb-6 border-b border-border">
                            <h4 className="font-heading text-lg font-medium text-foreground mb-4">
                              Booking Summary
                            </h4>
                            <div className="flex flex-wrap gap-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">Booked:</span>
                                <p className="font-medium text-foreground text-lg mt-1">
                                  {classItem.bookedCount}
                                </p>
                              </div>
                              {classItem.capacity !== null && (
                                <div>
                                  <span className="text-muted-foreground">Spots Left:</span>
                                  <p className="font-medium text-foreground text-lg mt-1">
                                    {classItem.spotsLeft}
                                  </p>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Total Revenue:</span>
                                <p className="font-medium text-foreground text-lg mt-1">
                                  €{classItem.totalRevenue.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Attendee List */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-heading text-lg font-medium text-foreground">
                                People Booked In
                              </h4>
                              {classBookings[classItem.id]?.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyEmails(classItem)}
                                    className="rounded-xl"
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy emails
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => exportAttendeesCSV(classItem)}
                                    className="rounded-xl"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                  </Button>
                                </div>
                              )}
                            </div>
                            {classBookings[classItem.id]?.length > 0 ? (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Paid At</TableHead>
                                      <TableHead>Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {classBookings[classItem.id].map((booking) => (
                                      <TableRow key={booking.id}>
                                        <TableCell className="font-medium">
                                          {booking.name}
                                        </TableCell>
                                        <TableCell>{booking.email}</TableCell>
                                        <TableCell>
                                          {booking.paid_at ? fmtDateTime(booking.paid_at) : "-"}
                                        </TableCell>
                                        <TableCell>€{booking.amount_eur.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-muted-foreground font-body">
                                No one booked in yet.
                              </p>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">
                {editingClass ? "Edit Class" : "Create Class"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_eur}
                    onChange={(e) =>
                      setFormData({ ...formData, price_eur: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked })
                    }
                  />
                  <Label>Published</Label>
                </div>
                {!formData.is_published && (
                  <p className="text-sm text-muted-foreground font-body ml-8">
                    Unpublished classes won't appear on the public classes page
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} className="rounded-xl">
                  {editingClass ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this class? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-xl bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminGuard>
  );
};

export default AdminClasses;

