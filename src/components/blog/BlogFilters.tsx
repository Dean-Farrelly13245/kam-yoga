import { cn } from "@/lib/utils";
import { blogCategories } from "@/data/blog";

interface BlogFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const BlogFilters = ({ activeFilter, onFilterChange }: BlogFiltersProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {blogCategories.map((category) => (
        <button
          key={category.value}
          onClick={() => onFilterChange(category.value)}
          className={cn(
            "px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300",
            activeFilter === category.value
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-card text-muted-foreground hover:bg-sage-light hover:text-foreground border border-border/50"
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default BlogFilters;
