import { cn } from "@/lib/utils";
import { classTypes } from "@/data/classes";

interface ClassFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const ClassFilters = ({ activeFilter, onFilterChange }: ClassFiltersProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {classTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onFilterChange(type.value)}
          className={cn(
            "px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300",
            activeFilter === type.value
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-card text-muted-foreground hover:bg-sage-light hover:text-foreground border border-border/50"
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};

export default ClassFilters;
