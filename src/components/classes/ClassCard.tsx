import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishedSession } from "@/lib/supabaseClient";
import { siteLocation } from "@/config/site";

interface ClassCardProps {
  classItem: PublishedSession;
  onBook: (classItem: PublishedSession) => void;
}

const ClassCard = ({ classItem, onBook }: ClassCardProps) => {
  const start = new Date(classItem.starts_at);
  const end = new Date(classItem.ends_at);
  const formattedDate = format(start, "EEEE, d MMMM");
  const timeDisplay = `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  const durationMins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const price = (classItem.price_cents || 0) / 100;
  const remaining = classItem.capacity != null && classItem.remaining_spots != null
    ? Math.max(classItem.remaining_spots, 0)
    : null;

  return (
    <div className="group bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              All levels welcome
            </p>
            <h3 className="font-heading text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300">
              {classItem.title}
            </h3>
          </div>
          <span className="font-heading text-2xl font-medium text-foreground">
            €{price.toFixed(2)}
          </span>
        </div>

        {classItem.description && (
          <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {classItem.description}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="px-6 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <Calendar size={16} className="text-primary shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <Clock size={16} className="text-primary shrink-0" />
          <span>{timeDisplay} · {durationMins} min</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <MapPin size={16} className="text-primary shrink-0" />
          <span>{siteLocation.addressLine}</span>
        </div>
        {remaining !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <Users size={16} className="text-primary shrink-0" />
            <span>{remaining} spots left</span>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="px-6 pb-6">
        {(() => {
          const classDateTime = new Date(classItem.starts_at);
          const isUpcoming = classDateTime > new Date();
          const hasSpots = remaining === null || remaining > 0;

          return isUpcoming && hasSpots ? (
            <Button 
              onClick={() => onBook(classItem)}
              className="w-full rounded-xl bg-primary hover:bg-sage-dark text-primary-foreground transition-all duration-300"
            >
              Book Now
            </Button>
          ) : null;
        })()}
      </div>
    </div>
  );
};

export default ClassCard;
