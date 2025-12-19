import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/data/blog";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const categoryColors = {
  reflections: "bg-sage-light text-sage-dark",
  practice: "bg-lavender-light text-accent-foreground",
  meditation: "bg-clay-light text-foreground",
  lifestyle: "bg-sand-light text-foreground",
};

const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  const formattedDate = format(parseISO(post.date), "d MMMM yyyy");

  if (featured) {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group block bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium font-body capitalize", categoryColors[post.category])}>
              {post.category}
            </span>
            <span className="text-sm text-muted-foreground font-body">
              {formattedDate}
            </span>
          </div>

          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground group-hover:text-primary transition-colors duration-300 mb-4">
            {post.title}
          </h2>

          <p className="font-body text-muted-foreground leading-relaxed mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-body">
              {post.readTime}
            </span>
            <span className="inline-flex items-center gap-1 font-body text-sm font-medium text-primary group-hover:gap-2 transition-all duration-300">
              Read more
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className={cn("px-3 py-1 rounded-full text-xs font-medium font-body capitalize", categoryColors[post.category])}>
            {post.category}
          </span>
        </div>

        <h3 className="font-heading text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
          {post.title}
        </h3>

        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground font-body">
          <span>{formattedDate}</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
