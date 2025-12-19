import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Class } from "@/lib/supabaseClient";

interface ClassCardProps {
  classItem: Class;
  onBook: (classItem: Class) => void;
}

const ClassCard = ({ classItem, onBook }: ClassCardProps) => {
  const formattedDate = format(parseISO(classItem.date), "EEEE, d MMMM");
  
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

  return (
    <div className="group bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          {classItem.price_eur && (
            <span className="font-heading text-2xl font-medium text-foreground">
              €{classItem.price_eur}
            </span>
          )}
        </div>

        <h3 className="font-heading text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300">
          {classItem.title}
        </h3>
        
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
          <span>
            {timeDisplay}
            {duration && ` · ${duration}`}
          </span>
        </div>
        {classItem.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <MapPin size={16} className="text-primary shrink-0" />
            <span>{classItem.location}</span>
          </div>
        )}
        {classItem.capacity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <span>Capacity: {classItem.capacity}</span>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="px-6 pb-6">
        {(() => {
          // Only show Book Now if class is upcoming and has a price
          const classDateTime = new Date(`${classItem.date}T${classItem.start_time}`);
          const isUpcoming = classDateTime > new Date();
          const hasPrice = classItem.price_eur && classItem.price_eur > 0;
          
          return isUpcoming && hasPrice ? (
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
