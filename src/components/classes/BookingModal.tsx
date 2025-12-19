import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, X, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClassItem } from "@/data/classes";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  classItem: ClassItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ classItem, isOpen, onClose }: BookingModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!classItem) return null;

  const formattedDate = format(parseISO(classItem.date), "EEEE, d MMMM yyyy");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate booking submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Booking Confirmed!",
      description: `You're booked for ${classItem.title}. A confirmation email has been sent to ${formData.email}.`,
    });

    setIsSubmitting(false);
    setFormData({ name: "", email: "", phone: "" });
    onClose();
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
              <span>{classItem.time} · {classItem.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <MapPin size={16} className="text-primary" />
              <span>{classItem.location}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
            <span className="font-body text-sm text-muted-foreground">Total</span>
            <span className="font-heading text-xl font-medium text-foreground">
              €{classItem.price}
            </span>
          </div>
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
            <Label htmlFor="phone" className="font-body text-sm">
              Phone Number
            </Label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+353 ..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10 rounded-xl border-border/50 focus:border-primary"
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
          Payment will be collected at the class. Cancellation policy applies.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
