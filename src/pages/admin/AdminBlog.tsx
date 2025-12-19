import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase, BlogPost } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Edit, Trash2, FileText, Upload, X, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { uploadBlogImage, deleteBlogImageByUrl } from "@/lib/storage";

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content_md: "",
    cover_image_url: "",
    is_published: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, "uploading" | "done" | "error">>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    });
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content_md: "",
      cover_image_url: "",
      is_published: false,
    });
    setImageUrls([]);
    setUploadingFiles({});
    setIsDialogOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content_md: post.content_md,
      cover_image_url: post.cover_image_url || "",
      is_published: post.is_published,
    });
    // Load existing images (use image_urls if available, fallback to cover_image_url)
    const existingImages = post.image_urls && post.image_urls.length > 0
      ? post.image_urls
      : post.cover_image_url
      ? [post.cover_image_url]
      : [];
    setImageUrls(existingImages);
    setUploadingFiles({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.slug || !formData.content_md) {
        toast({
          title: "Validation Error",
          description: "Title, slug, and content are required",
          variant: "destructive",
        });
        return;
      }

      // Check for slug uniqueness before saving
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("id, slug")
        .eq("slug", formData.slug)
        .maybeSingle();

      if (existingPost && existingPost.id !== editingPost?.id) {
        // Slug collision - find an available alternative
        let suggestedSlug = `${formData.slug}-2`;
        let counter = 2;
        let foundAvailable = false;
        
        // Try up to 10 variations to find an available slug
        for (let i = 0; i < 10; i++) {
          const { data: checkPost } = await supabase
            .from("blog_posts")
            .select("id")
            .eq("slug", suggestedSlug)
            .maybeSingle();
          
          if (!checkPost || checkPost.id === editingPost?.id) {
            foundAvailable = true;
            break;
          }
          counter++;
          suggestedSlug = `${formData.slug}-${counter}`;
        }

        if (!foundAvailable) {
          // Fallback: append timestamp
          suggestedSlug = `${formData.slug}-${Date.now()}`;
        }

        toast({
          title: "Slug Already Exists",
          description: `A post with this slug already exists. Suggested: "${suggestedSlug}"`,
          variant: "destructive",
        });
        
        // Update the form with suggested slug
        setFormData({ ...formData, slug: suggestedSlug });
        return;
      }

      // Set cover_image_url to first image for backwards compatibility
      const coverImage = imageUrls.length > 0 ? imageUrls[0] : null;

      const postData: any = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content_md: formData.content_md,
        cover_image_url: coverImage,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        is_published: formData.is_published,
      };

      // Handle published_at timestamp
      if (formData.is_published) {
        // If publishing (and wasn't already published), set published_at
        if (!editingPost?.published_at) {
          postData.published_at = new Date().toISOString();
        }
        // If already published, keep existing published_at (don't update it)
      } else {
        // If unpublishing, clear published_at
        postData.published_at = null;
      }

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) {
          if (error.code === "23505") {
            throw new Error("A post with this slug already exists. Please try a different slug.");
          }
          throw error;
        }

        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        const { data: newPost, error } = await supabase
          .from("blog_posts")
          .insert(postData)
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            throw new Error("A post with this slug already exists. Please try a different slug.");
          }
          throw error;
        }

        // Update editingPost so future uploads use the real postId
        if (newPost) {
          setEditingPost(newPost);
        }

        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      setIsDialogOpen(false);
      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", deletePostId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setDeletePostId(null);
      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const postId = editingPost?.id || "temp";
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      const fileId = `${Date.now()}-${Math.random()}`;
      setUploadingFiles((prev) => ({ ...prev, [fileId]: "uploading" }));

      try {
        const url = await uploadBlogImage(file, postId);
        setImageUrls((prev) => [...prev, url]);
        setUploadingFiles((prev) => ({ ...prev, [fileId]: "done" }));
      } catch (error: any) {
        setUploadingFiles((prev) => ({ ...prev, [fileId]: "error" }));
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    // Reset input
    event.target.value = "";
  };

  const handleRemoveImage = async (index: number) => {
    const url = imageUrls[index];
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);

    // Try to delete from storage
    try {
      await deleteBlogImageByUrl(url);
    } catch (error: any) {
      toast({
        title: "Warning",
        description: "Image removed from post but could not delete from storage. You may need to clean it up later.",
        variant: "default",
      });
    }
  };

  const handleSetCover = (index: number) => {
    const newUrls = [...imageUrls];
    const [coverImage] = newUrls.splice(index, 1);
    newUrls.unshift(coverImage);
    setImageUrls(newUrls);
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    const newUrls = [...imageUrls];
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newUrls.length) return;
    [newUrls[index], newUrls[newIndex]] = [newUrls[newIndex], newUrls[index]];
    setImageUrls(newUrls);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-heading text-3xl font-medium text-foreground">
                    Manage Blog Posts
                  </h1>
                  <p className="font-body text-muted-foreground mt-2">
                    Create, edit, and publish blog posts
                  </p>
                </div>
              </div>
              <Button onClick={handleCreate} className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="font-body text-muted-foreground">Loading...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="font-body text-muted-foreground mb-4">
                  No blog posts yet
                </p>
                <Button onClick={handleCreate} className="rounded-xl">
                  Create your first post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-card rounded-2xl p-6 border border-border hover:shadow-soft transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading text-xl font-medium text-foreground">
                            {post.title}
                          </h3>
                          {post.is_published ? (
                            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                              Draft
                            </span>
                          )}
                        </div>

                        {post.excerpt && (
                          <p className="font-body text-muted-foreground mb-4">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            /{post.slug}
                          </div>
                          {post.published_at && (
                            <span>
                              Published: {format(new Date(post.published_at), "MMM d, yyyy")}
                            </span>
                          )}
                          <span>
                            Created: {format(new Date(post.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(post)}
                          className="rounded-xl"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setDeletePostId(post.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="rounded-xl text-destructive hover:text-destructive"
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

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">
                {editingPost ? "Edit Blog Post" : "Create Blog Post"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="blog-post-slug"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (e.g., "finding-stillness-in-chaos")
                </p>
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={3}
                  className="rounded-xl"
                  placeholder="A brief summary of the post..."
                />
              </div>

              <div className="space-y-2">
                <Label>Content (Markdown) *</Label>
                <Textarea
                  value={formData.content_md}
                  onChange={(e) =>
                    setFormData({ ...formData, content_md: e.target.value })
                  }
                  rows={15}
                  className="rounded-xl font-mono text-sm"
                  placeholder="# Heading&#10;&#10;Your markdown content here..."
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="rounded-xl"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photos
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Max 8MB per image. First image will be used as cover.
                    </p>
                  </div>
                </div>

                {/* Image Manager */}
                {imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Images ({imageUrls.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div
                          key={url}
                          className="relative group bg-card border border-border rounded-xl overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                              Cover
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <div className="flex flex-col gap-2">
                              {index !== 0 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => handleSetCover(index)}
                                  className="h-8 w-8 rounded-lg"
                                  title="Set as cover"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => handleMoveImage(index, "left")}
                                  disabled={index === 0}
                                  className="h-8 w-8 rounded-lg"
                                  title="Move left"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => handleMoveImage(index, "right")}
                                  disabled={index === imageUrls.length - 1}
                                  className="h-8 w-8 rounded-lg"
                                  title="Move right"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveImage(index)}
                                className="h-8 w-8 rounded-lg"
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {Object.keys(uploadingFiles).length > 0 && (
                  <div className="space-y-2">
                    <Label>Upload Status</Label>
                    <div className="space-y-1">
                      {Object.entries(uploadingFiles).map(([fileId, status]) => (
                        <div key={fileId} className="flex items-center gap-2 text-sm">
                          {status === "uploading" && (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              <span className="text-muted-foreground">Uploading...</span>
                            </>
                          )}
                          {status === "done" && (
                            <>
                              <div className="h-4 w-4 rounded-full bg-green-500" />
                              <span className="text-muted-foreground">Uploaded</span>
                            </>
                          )}
                          {status === "error" && (
                            <>
                              <X className="h-4 w-4 text-destructive" />
                              <span className="text-destructive">Failed</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                />
                <Label>Published</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} className="rounded-xl">
                  {editingPost ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this blog post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-xl bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminGuard>
  );
};

export default AdminBlog;

