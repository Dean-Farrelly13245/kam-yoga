import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, Mail, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PublishedSession } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { callFunction } from "@/lib/functions";
import { siteLocation } from "@/config/site";

interface BookingModalProps {
  classItem: PublishedSession | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ classItem, isOpen, onClose }: BookingModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email && isOpen) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [user, isOpen]);

  if (!classItem) return null;

  const start = new Date(classItem.starts_at);
  const end = new Date(classItem.ends_at);
  const formattedDate = format(start, "EEEE, d MMMM yyyy");
  const durationMins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const timeDisplay = `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  const price = (classItem.price_cents || 0) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptPolicy) {
      toast({
        title: "Please accept the policies",
        description: "You must accept the booking policies to continue.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await callFunction<{ 
        url: string; 
        booking_id: string; 
        manage_token?: string;
      }>(
        "create-checkout-session",
        {
          classId: classItem.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
        },
      );

      if (response.url) {
        // Store manage_token in sessionStorage for guest users
        if (response.manage_token && !user) {
          sessionStorage.setItem(`booking_${response.booking_id}_token`, response.manage_token);
        }
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-medium text-foreground">
            Book Your Spot
          </DialogTitle>
        </DialogHeader>

        {/* Class Summary */}
        <div className="bg-sage-light/50 rounded-xl p-4 mb-4">
          <h4 className="font-heading text-lg font-medium text-foreground mb-3">
            {classItem.title}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <Calendar size={16} className="text-primary" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <Clock size={16} className="text-primary" />
              <span>{timeDisplay} · {durationMins} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <MapPin size={16} className="text-primary" />
              <span>{siteLocation.addressLine}</span>
            </div>
          </div>
          {classItem.price_cents && (
            <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
              <span className="font-body text-sm text-muted-foreground">Total</span>
              <span className="font-heading text-xl font-medium text-foreground">
                €{price.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-body text-sm">
              Full Name
            </Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 rounded-xl border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-sm">
              Email Address
            </Label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 rounded-xl border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-body text-sm flex items-center gap-2">
              <Phone size={14} /> Phone (optional)
            </Label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10 rounded-xl border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={acceptPolicy}
              onChange={(e) => setAcceptPolicy(e.target.checked)}
            />
            <div>
              <div className="flex items-center gap-2 font-heading text-sm text-foreground">
                <ShieldCheck size={16} className="text-primary" />
                I accept the booking and cancellation policies
              </div>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Cancellations within 24 hours may be non-refundable. Please arrive 10 minutes early.
              </p>
            </div>
          </label>


          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-primary hover:bg-sage-dark text-primary-foreground"
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center font-body">
          You will be redirected to Stripe to complete payment. Your booking will be confirmed after payment.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
