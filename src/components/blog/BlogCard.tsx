import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/lib/supabaseClient";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  const formattedDate = post.published_at
    ? format(parseISO(post.published_at), "d MMMM yyyy")
    : format(parseISO(post.created_at), "d MMMM yyyy");
  
  // Estimate read time from content
  const estimateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const readTime = estimateReadTime(post.content);

  // Get cover image (first from image_urls, fallback to hero_image_url)
  const coverImage = (post.image_urls && post.image_urls.length > 0)
    ? post.image_urls[0]
    : post.hero_image_url;

  if (featured) {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group block bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden"
      >
        {coverImage && (
          <div className="w-full h-64 overflow-hidden">
            <img
              src={coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-muted-foreground font-body">
              {formattedDate}
            </span>
          </div>

          <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground group-hover:text-primary transition-colors duration-300 mb-4">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-body">
              {readTime}
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
      {coverImage && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-heading text-xl font-medium text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground font-body">
          <span>{formattedDate}</span>
          <span>{readTime}</span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
