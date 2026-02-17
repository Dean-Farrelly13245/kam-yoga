import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Edit, MapPin, Plus, Trash2, Users } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useToast } from "@/hooks/use-toast";
import { supabase, ClassSession } from "@/lib/supabaseClient";
import { siteLocation } from "@/config/site";
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

const AdminClasses = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "Yoga Class",
    description: "",
    starts_at: "",
    ends_at: "",
    price_cents: "",
    capacity: "",
    is_active: false,
  });

  useEffect(() => {
    void loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("starts_at", { ascending: false });

    if (error) {
      toast({
        title: "Failed to load sessions",
        description: error.message,
        variant: "destructive",
      });
      setSessions([]);
    } else {
      setSessions((data || []).map((s: any) => ({
        id: s.id,
        title: s.title || "Yoga Class",
        description: s.description,
        starts_at: s.starts_at,
        ends_at: s.ends_at,
        price_cents: s.price_cents,
        currency: s.currency || "eur",
        capacity: s.capacity,
        is_active: s.is_active,
        created_at: s.created_at,
      })));
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "Yoga Class",
      description: "",
      starts_at: "",
      ends_at: "",
      price_cents: "",
      capacity: "",
      is_active: false,
    });
    setEditingSession(null);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (session: ClassSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || "",
      starts_at: session.starts_at.slice(0, 16),
      ends_at: session.ends_at.slice(0, 16),
      price_cents: session.price_cents?.toString() || "",
      capacity: session.capacity?.toString() || "",
      is_active: session.is_active,
    });
    setIsDialogOpen(true);
  };

  const saveSession = async () => {
    if (!formData.starts_at || !formData.ends_at || !formData.price_cents) {
      toast({
        title: "Missing fields",
        description: "Start, end time and price are required.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      title: formData.title || "Yoga Class",
      description: formData.description || null,
      starts_at: new Date(formData.starts_at).toISOString(),
      ends_at: new Date(formData.ends_at).toISOString(),
      price_cents: Number(formData.price_cents),
      currency: "eur",
      capacity: formData.capacity ? Number(formData.capacity) : null,
      is_active: formData.is_active,
    };

    const { error } = editingSession
      ? await supabase.from("classes").update(payload).eq("id", editingSession.id)
      : await supabase.from("classes").insert(payload);

    if (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Saved" });
    setIsDialogOpen(false);
    await loadSessions();
  };

  const deleteSession = async () => {
    if (!deleteId) return;
    const { count, error: countError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("class_id", deleteId)
      .eq("status", "paid");
    if (countError) {
      toast({
        title: "Delete failed",
        description: countError.message,
        variant: "destructive",
      });
      setDeleteId(null);
      return;
    }
    if ((count ?? 0) > 0) {
      toast({
        title: "Cannot delete",
        description: "This class has paid bookings. Disable it instead.",
        variant: "destructive",
      });
      setDeleteId(null);
      return;
    }

    const { error } = await supabase.from("classes").delete().eq("id", deleteId);
    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Session deleted" });
      await loadSessions();
    }
    setDeleteId(null);
  };

  const togglePublish = async (session: ClassSession) => {
    const { error } = await supabase
      .from("classes")
      .update({ is_active: !session.is_active })
      .eq("id", session.id);
    if (error) {
      toast({
        title: "Publish toggle failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await loadSessions();
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-heading text-3xl text-foreground">Class Sessions</h1>
                  <p className="font-body text-muted-foreground">
                    In-person only. All levels welcome. Location: {siteLocation.addressLine}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {import.meta.env.DEV && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={async () => {
                      const sampleRows = [
                        {
                          title: "Morning Flow",
                          description: "All-levels vinyasa to start the day",
                          starts_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
                          ends_at: new Date(Date.now() + 1000 * 60 * 60 * 49).toISOString(),
                          price_cents: 1800,
                          currency: "eur",
                          capacity: 12,
                          is_active: true,
                        },
                        {
                          title: "Evening Yin",
                          description: "Slow stretches and deep relaxation",
                          starts_at: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
                          ends_at: new Date(Date.now() + 1000 * 60 * 60 * 97.25).toISOString(),
                          price_cents: 2000,
                          currency: "eur",
                          capacity: 10,
                          is_active: true,
                        },
                        {
                          title: "Beginner Foundations",
                          description: "Learn the basics with alignment cues",
                          starts_at: new Date(Date.now() + 1000 * 60 * 60 * 144).toISOString(),
                          ends_at: new Date(Date.now() + 1000 * 60 * 60 * 145).toISOString(),
                          price_cents: 1500,
                          currency: "eur",
                          capacity: 16,
                          is_active: true,
                        },
                      ];
                      const { error } = await supabase.from("classes").insert(sampleRows);
                      if (error) {
                        toast({
                          title: "Seed failed",
                          description: error.message,
                          variant: "destructive",
                        });
                      } else {
                        toast({ title: "Sample classes created" });
                        await loadSessions();
                      }
                    }}
                  >
                    Seed samples
                  </Button>
                )}
                <Button onClick={openCreate} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </div>
            </div>

            {isLoading ? (
              <p className="font-body text-muted-foreground">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <p className="font-body text-muted-foreground mb-3">No sessions yet.</p>
                <Button onClick={openCreate} className="rounded-xl">Create your first session</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const start = new Date(session.starts_at);
                  const end = new Date(session.ends_at);
                  const price = (session.price_cents || 0) / 100;
                  return (
                    <div key={session.id} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading text-xl text-foreground">{session.title}</h3>
                            <span className="text-xs px-2 py-1 rounded-full border border-border">
                              {session.is_active ? "Published" : "Draft"}
                            </span>
                          </div>
                          {session.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {session.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {start.toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {session.capacity ?? "Open"} capacity
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {siteLocation.addressLine}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="font-heading text-2xl text-foreground">€{price.toFixed(2)}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openEdit(session)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-xl"
                              onClick={() => togglePublish(session)}
                            >
                              {session.is_active ? "Unpublish" : "Publish"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl text-destructive"
                              onClick={() => setDeleteId(session.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingSession ? "Edit Session" : "New Session"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (EUR)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_cents ? (Number(formData.price_cents) / 100).toString() : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, price_cents: Math.round(Number(e.target.value) * 100).toString() })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (leave blank for open)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <span className="text-sm text-muted-foreground">Published</span>
              </div>
              <div className="bg-sage-light/40 border border-border rounded-xl p-3 text-sm text-muted-foreground">
                All sessions are in-person at {siteLocation.addressLine}. All levels welcome.
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="rounded-xl" onClick={saveSession}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete session?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the session. Bookings tied to it will remain in the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive hover:bg-destructive/90"
                onClick={deleteSession}
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

