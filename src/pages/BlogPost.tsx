import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, Clock, User, X } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase, BlogPost } from "@/lib/supabaseClient";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;

      if (data) {
        setPost(data);
        // Load related posts (exclude current)
        const { data: related } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .neq("id", data.id)
          .order("published_at", { ascending: false, nullsLast: true })
          .limit(2);
        
        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error("Error loading blog post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 lg:px-8 py-12">
            <div className="text-center">
              <p className="font-body text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formattedDate = post.published_at
    ? format(parseISO(post.published_at), "d MMMM yyyy")
    : format(parseISO(post.created_at), "d MMMM yyyy");

  // Estimate read time
  const estimateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const readTime = estimateReadTime(post.content_md);

  // Get cover image and gallery images
  const coverImage = (post.image_urls && post.image_urls.length > 0)
    ? post.image_urls[0]
    : post.cover_image_url;
  const galleryImages = (post.image_urls && post.image_urls.length > 1)
    ? post.image_urls.slice(1)
    : [];

  // Render markdown content with XSS protection
  const renderContent = () => {
    const rawHtml = marked.parse(post.content_md);
    const safeHtml = DOMPurify.sanitize(rawHtml);
    return { __html: safeHtml };
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
              {/* Cover Image */}
              {coverImage && (
                <div className="mb-8">
                  <img
                    src={coverImage}
                    alt={post.title}
                    className="w-full rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxImage(coverImage)}
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6">
                {post.title}
              </h1>

              {/* Post Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-body pb-8 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{readTime}</span>
                </div>
              </div>

              {/* Content */}
              <div
                className="pt-10 prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:font-body prose-p:text-foreground/90 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:font-body prose-ol:font-body"
                dangerouslySetInnerHTML={renderContent()}
              />

              {/* Image Gallery */}
              {galleryImages.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-heading text-2xl font-medium text-foreground mb-6">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxImage(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt={`${post.title} - Image ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      <h3 className="font-heading text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground font-body line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X size={24} />
          </button>
          <div className="max-w-6xl max-h-full">
            <img
              src={lightboxImage}
              alt="Gallery"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
