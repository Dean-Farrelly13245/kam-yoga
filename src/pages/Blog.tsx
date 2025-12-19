import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogCard from "@/components/blog/BlogCard";
import BlogFilters from "@/components/blog/BlogFilters";
import { blogPosts } from "@/data/blog";

const Blog = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  const filteredPosts = activeFilter === "all"
    ? regularPosts
    : regularPosts.filter((post) => post.category === activeFilter);

  const filteredFeatured = activeFilter === "all"
    ? featuredPosts
    : featuredPosts.filter((post) => post.category === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-lavender-light/50 to-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
                The Journal
              </span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-light text-foreground">
                Reflections on the Path
              </h1>
              <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed">
                Thoughts on yoga, meditation, spiritual growth, and bringing 
                presence into everyday life.
              </p>
            </div>

            {/* Filters */}
            <div className="mt-12">
              <BlogFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {filteredFeatured.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground mb-8">
                  Featured
                </h2>
                <div className="space-y-6">
                  {filteredFeatured.map((post) => (
                    <BlogCard key={post.id} post={post} featured />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {filteredFeatured.length > 0 && (
                <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground mb-8">
                  All Posts
                </h2>
              )}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="font-body text-lg text-muted-foreground">
                    No posts in this category yet.
                  </p>
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="mt-4 font-body text-primary hover:text-sage-dark underline underline-offset-4 transition-colors"
                  >
                    View all posts
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 lg:py-20 bg-card">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-heading text-2xl md:text-3xl font-light text-foreground">
                Stay Connected
              </h2>
              <p className="mt-4 font-body text-muted-foreground">
                Receive occasional reflections, class updates, and gentle reminders 
                to pause and breathe.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button className="px-6 py-3 rounded-xl bg-primary hover:bg-sage-dark text-primary-foreground font-body text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground font-body">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
