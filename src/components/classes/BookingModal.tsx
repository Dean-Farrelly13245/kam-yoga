import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Class } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { callFunction } from "@/lib/functions";

interface BookingModalProps {
  classItem: Class | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ classItem, isOpen, onClose }: BookingModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!classItem) return null;

  const formattedDate = format(parseISO(classItem.date), "EEEE, d MMMM yyyy");
  
  // Calculate duration if end_time is available
  const getDuration = () => {
    if (!classItem.end_time) return null;
    const start = new Date(`2000-01-01T${classItem.start_time}`);
    const end = new Date(`2000-01-01T${classItem.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const duration = getDuration();
  const timeDisplay = classItem.end_time 
    ? `${classItem.start_time} - ${classItem.end_time}`
    : classItem.start_time;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the create-checkout-session function
      const { url } = await callFunction<{ url: string }>(
        "create-checkout-session",
        {
          classId: classItem.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
        }
      );

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
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
              <span>
                {timeDisplay}
                {duration && ` · ${duration}`}
              </span>
            </div>
            {classItem.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <MapPin size={16} className="text-primary" />
                <span>{classItem.location}</span>
              </div>
            )}
          </div>
          {classItem.price_eur && (
            <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
              <span className="font-body text-sm text-muted-foreground">Total</span>
              <span className="font-heading text-xl font-medium text-foreground">
                €{classItem.price_eur}
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
