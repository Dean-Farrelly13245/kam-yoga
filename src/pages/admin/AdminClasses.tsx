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
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, MapPin, Euro, Users, ChevronDown, ChevronUp, Download } from "lucide-react";
import { format } from "date-fns";
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

  const loadClasses = async () => {
    try {
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .order("date", { ascending: true });

      if (classesError) throw classesError;

      // Load booking statistics for each class
      const classesWithStats: ClassWithStats[] = await Promise.all(
        (classesData || []).map(async (classItem) => {
          // Get paid bookings count and revenue
          const { data: paidBookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("amount_eur")
            .eq("class_id", classItem.id)
            .eq("status", "paid");

          if (bookingsError) {
            console.error("Error loading bookings:", bookingsError);
          }

          const paidCount = paidBookings?.length || 0;
          const totalRevenue = paidBookings?.reduce((sum, b) => sum + (b.amount_eur || 0), 0) || 0;
          const spotsLeft = classItem.capacity !== null 
            ? Math.max(0, classItem.capacity - paidCount)
            : null;

          return {
            ...classItem,
            paidBookingsCount: paidCount,
            totalRevenue,
            spotsLeft,
          };
        })
      );

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
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

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
        const bookings = classBookings[expandedClassId] || [];
        const booking = bookings.find((b) => b.id === bookingId);
        if (booking) {
          loadClassBookings(expandedClassId);
        }
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
            ) : (
              <div className="space-y-4">
                {classes.map((classItem) => (
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
                            </div>

                            {classItem.description && (
                              <p className="font-body text-muted-foreground mb-4">
                                {classItem.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(classItem.date), "MMM d, yyyy")}
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
                                  {classItem.paidBookingsCount} paid
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
                          <h4 className="font-heading text-lg font-medium text-foreground mt-6 mb-4">
                            Attendees
                          </h4>
                          {classBookings[classItem.id]?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Paid At</TableHead>
                                    <TableHead>Actions</TableHead>
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
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${
                                            booking.status === "paid"
                                              ? "bg-green-100 text-green-800"
                                              : booking.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : booking.status === "expired"
                                              ? "bg-gray-100 text-gray-800"
                                              : booking.status === "refunded"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-muted text-muted-foreground"
                                          }`}
                                        >
                                          {booking.status}
                                        </span>
                                      </TableCell>
                                      <TableCell>€{booking.amount_eur.toFixed(2)}</TableCell>
                                      <TableCell>
                                        {booking.paid_at
                                          ? format(new Date(booking.paid_at), "MMM d, yyyy HH:mm")
                                          : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {booking.status !== "cancelled" && (
                                          <Select
                                            value={booking.status}
                                            onValueChange={(value) =>
                                              handleUpdateBookingStatus(booking.id, value)
                                            }
                                          >
                                            <SelectTrigger className="w-32 h-8 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="paid">Paid</SelectItem>
                                              <SelectItem value="pending">Pending</SelectItem>
                                              <SelectItem value="cancelled">Cancelled</SelectItem>
                                              <SelectItem value="expired">Expired</SelectItem>
                                              <SelectItem value="refunded">Refunded</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-muted-foreground font-body">
                              No bookings yet
                            </p>
                          )}
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

