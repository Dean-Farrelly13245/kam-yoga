import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassItem } from "@/data/classes";
import { cn } from "@/lib/utils";

interface ClassCardProps {
  classItem: ClassItem;
  onBook: (classItem: ClassItem) => void;
}

const typeColors = {
  yoga: "bg-sage-light text-sage-dark",
  meditation: "bg-lavender-light text-accent-foreground",
  workshop: "bg-clay-light text-foreground",
  kids: "bg-sand-light text-foreground",
};

const typeLabels = {
  yoga: "Yoga",
  meditation: "Meditation",
  workshop: "Workshop",
  kids: "Children's",
};

const ClassCard = ({ classItem, onBook }: ClassCardProps) => {
  const formattedDate = format(parseISO(classItem.date), "EEEE, d MMMM");
  const spotsLow = classItem.spotsLeft <= 3;

  return (
    <div className="group bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <span className={cn("px-3 py-1 rounded-full text-xs font-medium font-body", typeColors[classItem.type])}>
            {typeLabels[classItem.type]}
          </span>
          <span className="font-heading text-2xl font-medium text-foreground">
            €{classItem.price}
          </span>
        </div>

        <h3 className="font-heading text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300">
          {classItem.title}
        </h3>
        
        <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {classItem.description}
        </p>
      </div>

      {/* Details */}
      <div className="px-6 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <Calendar size={16} className="text-primary shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <Clock size={16} className="text-primary shrink-0" />
          <span>{classItem.time} · {classItem.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <MapPin size={16} className="text-primary shrink-0" />
          <span>{classItem.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-body">
          <Users size={16} className={cn("shrink-0", spotsLow ? "text-clay" : "text-primary")} />
          <span className={spotsLow ? "text-clay font-medium" : "text-muted-foreground"}>
            {classItem.spotsLeft} spots left
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="px-6 pb-6">
        <Button 
          onClick={() => onBook(classItem)}
          className="w-full rounded-xl bg-primary hover:bg-sage-dark text-primary-foreground transition-all duration-300"
          disabled={classItem.spotsLeft === 0}
        >
          {classItem.spotsLeft === 0 ? "Fully Booked" : "Book Now"}
        </Button>
      </div>
    </div>
  );
};

export default ClassCard;
