import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { supabase, BlogPost } from "@/lib/supabaseClient";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
    document.title = "Blog | Kamyoga";
  }, []);

  const loadPosts = async () => {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .lte("published_at", nowIso)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading blog posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-blue-sage-section to-background">
          <div className="container mx-auto px-5 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-foreground/45 font-medium">
                The Journal
              </span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-light text-foreground">
                Reflections on the Path
              </h1>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-5 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {isLoading ? (
                <div className="text-center py-16">
                  <p className="font-body text-muted-foreground">Loading posts...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="font-body text-lg text-muted-foreground">
                    No blog posts yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
