import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Edit, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useToast } from "@/hooks/use-toast";
import { supabase, BlogPost } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const AdminBlog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  useEffect(() => {
    void loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        title: "Failed to load posts",
        description: error.message,
        variant: "destructive",
      });
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setMutatingId(deleteId);
    const { error } = await supabase.from("blog_posts").delete().eq("id", deleteId);
    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Post deleted" });
      await loadPosts();
    }
    setMutatingId(null);
    setDeleteId(null);
  };

  const togglePublish = async (post: BlogPost) => {
    setMutatingId(post.id);
    const targetStatus = post.status === "published" ? "draft" : "published";
    const payload: Partial<BlogPost> = {
      status: targetStatus,
      published_at: targetStatus === "published" ? new Date().toISOString() : null,
    };
    const { error } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("id", post.id);
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: targetStatus === "published" ? "Published" : "Unpublished",
        description: post.title,
      });
      await loadPosts();
    }
    setMutatingId(null);
  };

  const renderStatus = (post: BlogPost) => {
    const isPublished = post.status === "published" && post.published_at;
    return (
      <div className="flex items-center gap-2">
        <Badge variant={isPublished ? "default" : "secondary"}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
        {isPublished && post.published_at ? (
          <span className="text-xs text-muted-foreground">
            {format(new Date(post.published_at), "MMM d, yyyy")}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-heading text-3xl font-medium text-foreground">
                    Blog Posts
                  </h1>
                  <p className="font-body text-muted-foreground text-sm">
                    Create, edit, publish, or unpublish posts.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/blog" className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" />
                    View public blog
                  </Link>
                </Button>
                <Button asChild className="rounded-xl">
                  <Link to="/admin/blog/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Post
                  </Link>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="font-body text-muted-foreground mb-4">
                  No blog posts yet.
                </p>
                <Button asChild className="rounded-xl">
                  <Link to="/admin/blog/new">Create your first post</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-border bg-card p-6 shadow-soft"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-xl text-foreground">
                            {post.title}
                          </h3>
                        </div>
                        {post.excerpt ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono text-xs">/{post.slug}</span>
                          {renderStatus(post)}
                          <span>
                            Updated {format(new Date(post.updated_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          disabled={mutatingId === post.id}
                        >
                          <Link to={`/admin/blog/edit/${post.id}`} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => togglePublish(post)}
                          disabled={mutatingId === post.id}
                        >
                          {mutatingId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : post.status === "published" ? (
                            "Unpublish"
                          ) : (
                            "Publish"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-destructive"
                          onClick={() => setDeleteId(post.id)}
                          disabled={mutatingId === post.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the post and its metadata. Images in storage stay until you delete them there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={mutatingId === deleteId}
            >
              {mutatingId === deleteId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminGuard>
  );
};

export default AdminBlog;

