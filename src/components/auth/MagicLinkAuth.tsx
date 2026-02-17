import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface MagicLinkAuthProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

const MagicLinkAuth = ({ redirectTo, onSuccess }: MagicLinkAuthProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/bookings`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      toast({
        title: "Failed to send magic link",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="bg-sage-light/30 border border-border rounded-2xl p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="font-heading text-xl font-medium text-foreground mb-2">
          Check your email
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-4">
          We've sent a magic link to <strong>{email}</strong>
        </p>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Click the link in the email to sign in. The link will expire in 1 hour.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
          className="rounded-xl"
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="font-heading text-xl font-medium text-foreground mb-2">
          Sign in or create an account
        </h3>
        <p className="font-body text-sm text-muted-foreground">
          We'll email you a magic link for a password-free sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-email" className="font-body text-sm">
            Email Address
          </Label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="auth-email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-xl border-border/50 focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary hover:bg-sage-dark text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            "Send magic link"
          )}
        </Button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground text-center font-body">
        By continuing, you agree to receive emails from us. No password required.
      </p>
    </div>
  );
};

export default MagicLinkAuth;
