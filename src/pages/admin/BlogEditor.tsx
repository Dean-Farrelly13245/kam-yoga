import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import { useToast } from "@/hooks/use-toast";
import { supabase, BlogPost } from "@/lib/supabaseClient";
import { uploadBlogImage } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [heroUploadState, setHeroUploadState] = useState<"idle" | "uploading">(
    "idle"
  );
  const [inlineUploadState, setInlineUploadState] = useState<"idle" | "uploading">(
    "idle"
  );

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "draft" | "published";
    published_at: string | null;
    hero_image_url: string;
    image_urls: string[];
    schedule: string;
    slugTouched: boolean;
  }>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft",
    published_at: null,
    hero_image_url: "",
    image_urls: [],
    schedule: "",
    slugTouched: false,
  });

  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!isEditing || !id) {
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        toast({
          title: "Post not found",
          description: "Returning to blog list.",
          variant: "destructive",
        });
        navigate("/admin/blog");
        return;
      }
      const scheduleValue = data.published_at
        ? data.published_at.slice(0, 16)
        : "";
      setPostId(data.id);
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content,
        status: data.status as "draft" | "published",
        published_at: data.published_at,
        hero_image_url: data.hero_image_url || "",
        image_urls: data.image_urls || [],
        schedule: scheduleValue,
        slugTouched: true,
      });
      setIsLoading(false);
    };

    void fetchPost();
  }, [id, isEditing, navigate, toast]);

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slugTouched ? prev.slug : generateSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(value),
      slugTouched: true,
    }));
  };

  const savePost = async (targetStatus: "draft" | "published") => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast({
        title: "Missing required fields",
        description: "Title, slug, and content are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const scheduleDate =
      targetStatus === "published" && formData.schedule
        ? new Date(formData.schedule).toISOString()
        : null;

    const payload = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      hero_image_url: formData.hero_image_url || null,
      image_urls: formData.image_urls.length ? formData.image_urls : null,
      status: targetStatus,
      published_at:
        targetStatus === "published"
          ? scheduleDate || formData.published_at || new Date().toISOString()
          : null,
    };

    const uniqueCheck = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", formData.slug)
      .maybeSingle();
    if (uniqueCheck.error && uniqueCheck.error.code !== "PGRST116") {
      toast({
        title: "Failed to validate slug",
        description: uniqueCheck.error.message,
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }
    if (uniqueCheck.data && uniqueCheck.data.id !== postId) {
      toast({
        title: "Slug already exists",
        description: "Choose a different slug.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (postId) {
      const { error } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", postId);
      if (error) {
        toast({
          title: "Save failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: targetStatus === "published" ? "Published" : "Draft saved" });
      }
    } else {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({ ...payload, author_id: null })
        .select("*")
        .single();
      if (error) {
        toast({
          title: "Save failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      setPostId(data.id);
      updateField("published_at", data.published_at);
      toast({ title: targetStatus === "published" ? "Published" : "Draft saved" });
    }

    setIsSaving(false);
  };

  const handleHeroUpload = async (file: File) => {
    if (!postId) {
      toast({
        title: "Save draft first",
        description: "Save the post before uploading images so we can use its id.",
      });
      return;
    }
    setHeroUploadState("uploading");
    try {
      const url = await uploadBlogImage(file, postId, "hero");
      updateField("hero_image_url", url);
      toast({ title: "Hero image uploaded" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setHeroUploadState("idle");
    }
  };

  const handleInlineUpload = async (file: File) => {
    if (!postId) {
      toast({
        title: "Save draft first",
        description: "Save the post before uploading images.",
      });
      return;
    }
    setInlineUploadState("uploading");
    try {
      const url = await uploadBlogImage(file, postId, "inline");
      setFormData((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, url],
        content: `${prev.content}\n\n![Image description](${url})\n\n`,
      }));
      toast({ title: "Image uploaded", description: "Added to content as markdown." });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInlineUploadState("idle");
    }
  };

  const renderedPreview = useMemo(() => {
    const raw = marked.parse(formData.content || "");
    return DOMPurify.sanitize(raw);
  }, [formData.content]);

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" className="rounded-xl" asChild>
              <Link to="/admin/blog">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl text-foreground">
                {isEditing ? "Edit Blog Post" : "New Blog Post"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Markdown editor with live preview. Mobile-friendly actions stay sticky.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  className="rounded-xl"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="A calm mind in a busy world"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  className="rounded-xl font-mono"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="calm-mind-busy-world"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea
                className="rounded-xl"
                value={formData.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
                rows={3}
                placeholder="Short description shown on cards."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Hero image</Label>
                <span className="text-xs text-muted-foreground">
                  Recommended 1200x630. Save draft before upload.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={heroUploadState === "uploading"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleHeroUpload(file);
                  }}
                />
                {heroUploadState === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
              {formData.hero_image_url ? (
                <div className="rounded-xl border border-border p-3">
                  <img
                    src={formData.hero_image_url}
                    alt="Hero"
                    className="w-full rounded-lg object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Content (Markdown) *</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={isPreview} onCheckedChange={setIsPreview} />
                  <span className="text-sm text-muted-foreground">Preview</span>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Textarea
                  ref={contentRef}
                  className={cn(
                    "rounded-xl font-mono text-sm min-h-[300px]",
                    isPreview && "hidden md:block"
                  )}
                  value={formData.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  placeholder="# Heading\n\nYour story..."
                />
                <div
                  className={cn(
                    "rounded-xl border border-border bg-card p-4 prose max-w-none prose-headings:font-heading prose-p:font-body",
                    !isPreview && "hidden md:block"
                  )}
                  dangerouslySetInnerHTML={{ __html: renderedPreview }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm cursor-pointer">
                  <ImageIcon className="h-4 w-4" />
                  {inlineUploadState === "uploading" ? "Uploading..." : "Insert image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={inlineUploadState === "uploading"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleInlineUpload(file);
                    }}
                  />
                </label>
                <span className="text-xs text-muted-foreground">
                  Images are added as markdown links.
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  {formData.status === "published" ? "Published" : "Draft"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Schedule publish (optional)</Label>
                <Input
                  type="datetime-local"
                  className="rounded-xl"
                  value={formData.schedule}
                  onChange={(e) => updateField("schedule", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Published at</Label>
                <Input
                  readOnly
                  className="rounded-xl"
                  value={formData.published_at ? formData.published_at : "Not published"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 bg-background/95 border-t border-border backdrop-blur">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-2 justify-between max-w-5xl">
            <div className="text-xs text-muted-foreground">
              Uploads need the post id — save draft before adding images.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => savePost("draft")}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="ml-2">Save draft</span>
              </Button>
              <Button
                className="rounded-xl"
                onClick={() => savePost("published")}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="ml-2">Publish</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default BlogEditor;
