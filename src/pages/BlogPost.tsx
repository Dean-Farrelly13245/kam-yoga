import { useParams, Link, Navigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { blogPosts } from "@/data/blog";
import { cn } from "@/lib/utils";

const categoryColors = {
  reflections: "bg-sage-light text-sage-dark",
  practice: "bg-lavender-light text-accent-foreground",
  meditation: "bg-clay-light text-foreground",
  lifestyle: "bg-sand-light text-foreground",
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formattedDate = format(parseISO(post.date), "d MMMM yyyy");

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  // Convert markdown-like content to JSX
  const renderContent = (content: string) => {
    const paragraphs = content.split("\n\n");
    
    return paragraphs.map((paragraph, index) => {
      // Handle headings
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={index} className="font-heading text-2xl font-medium text-foreground mt-10 mb-4">
            {paragraph.replace("## ", "")}
          </h2>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="font-body text-foreground/90 leading-relaxed mb-6">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Back Link */}
        <div className="container mx-auto px-6 lg:px-8 pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Journal
          </Link>
        </div>

        {/* Article Header */}
        <article className="py-12 lg:py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium font-body capitalize", categoryColors[post.category])}>
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6">
                {post.title}
              </h1>

              {/* Post Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-body pb-8 border-b border-border">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{post.readTime}</span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-10">
                {renderContent(post.content)}
              </div>

              {/* Author Bio */}
              <div className="mt-16 p-8 bg-card rounded-2xl border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center">
                    <span className="font-heading text-xl font-medium text-primary">K</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-medium text-foreground">
                      Kellyann
                    </h3>
                    <p className="text-sm text-muted-foreground font-body mb-2">
                      Founder, Kam Yoga
                    </p>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      Teaching yoga and meditation since 2008, guiding students on their 
                      journey of self-discovery and heart connection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 lg:py-20 bg-card">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="font-heading text-2xl font-light text-foreground mb-8 text-center">
                  Continue Reading
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group block bg-background rounded-2xl border border-border/50 p-6 hover:shadow-card transition-all duration-300"
                    >
                      <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-medium font-body capitalize mb-3", categoryColors[relatedPost.category])}>
                        {relatedPost.category}
                      </span>
                      <h3 className="font-heading text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground font-body">
                        {relatedPost.readTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
