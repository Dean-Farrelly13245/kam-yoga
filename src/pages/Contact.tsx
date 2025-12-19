import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, Phone, Send, MessageCircle, Calendar, User, Instagram } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  subject: z.enum(["general", "booking", "private", "workshop"]),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjectOptions = [
  { value: "general", label: "General Enquiry", icon: MessageCircle },
  { value: "booking", label: "Class Booking", icon: Calendar },
  { value: "private", label: "Private Session", icon: User },
  { value: "workshop", label: "Workshop Enquiry", icon: Calendar },
] as const;

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent",
      description: "Thank you for reaching out. I will get back to you soon.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "general",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-sand-light/50 to-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="font-body text-sm uppercase tracking-widest text-primary font-medium">
                Get in Touch
              </span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-light text-foreground">
                Let's Connect
              </h1>
              <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed">
                Whether you have a question, want to book a class, or simply wish to say hello — 
                I would love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="font-heading text-2xl font-medium text-foreground mb-4">
                    Reach Out
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    I aim to respond to all enquiries within 24-48 hours. 
                    For urgent class bookings, please mention this in your message.
                  </p>
                </div>

                <div className="space-y-4">
                  <a
                    href="mailto:hello@kamyoga.com"
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all duration-300 group"
                  >
                    <div className="p-3 rounded-full bg-sage-light group-hover:bg-primary/20 transition-colors">
                      <Mail size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Email</p>
                      <p className="font-body text-foreground">hello@kamyoga.com</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50">
                    <div className="p-3 rounded-full bg-sage-light">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Location</p>
                      <p className="font-body text-foreground">Dublin, Ireland</p>
                    </div>
                  </div>

                  <a
                    href="tel:0851051294"
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all duration-300 group"
                  >
                    <div className="p-3 rounded-full bg-sage-light group-hover:bg-primary/20 transition-colors">
                      <Phone size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Phone</p>
                      <p className="font-body text-foreground">085 105 1294</p>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com/kelly81molloy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all duration-300 group"
                  >
                    <div className="p-3 rounded-full bg-sage-light group-hover:bg-primary/20 transition-colors">
                      <Instagram size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Instagram</p>
                      <p className="font-body text-foreground">@kelly81molloy</p>
                    </div>
                  </a>
                </div>

                {/* Quote */}
                <div className="p-6 bg-lavender-light/50 rounded-xl">
                  <blockquote className="font-heading text-lg italic text-foreground leading-relaxed">
                    "Every conversation is an opportunity for connection. I look forward to hearing from you."
                  </blockquote>
                  <p className="mt-3 font-body text-sm text-muted-foreground">— Kellyann</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
                  <h2 className="font-heading text-2xl font-medium text-foreground mb-6">
                    Send a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject Selection */}
                    <div className="space-y-3">
                      <Label className="font-body text-sm">What can I help you with?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {subjectOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, subject: option.value })}
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-xl border text-left transition-all duration-300 font-body text-sm",
                                formData.subject === option.value
                                  ? "border-primary bg-sage-light/50 text-foreground"
                                  : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-card"
                              )}
                            >
                              <Icon size={16} className={formData.subject === option.value ? "text-primary" : ""} />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-body text-sm">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={cn(
                            "rounded-xl border-border/50 focus:border-primary",
                            errors.name && "border-destructive"
                          )}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive font-body">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-body text-sm">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={cn(
                            "rounded-xl border-border/50 focus:border-primary",
                            errors.email && "border-destructive"
                          )}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive font-body">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone (optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-body text-sm">
                        Phone <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+353 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl border-border/50 focus:border-primary"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-body text-sm">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell me how I can help..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={cn(
                          "rounded-xl border-border/50 focus:border-primary resize-none",
                          errors.message && "border-destructive"
                        )}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive font-body">{errors.message}</p>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-primary hover:bg-sage-dark text-primary-foreground py-6 text-base"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send size={18} className="ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center font-body">
                      Your information is kept private and never shared.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20 bg-card">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-heading text-2xl md:text-3xl font-light text-foreground text-center mb-12">
                Common Questions
              </h2>
              <div className="space-y-6">
                {[
                  {
                    q: "Do I need experience to join a class?",
                    a: "Not at all. All classes welcome complete beginners. I will guide you through everything and offer modifications as needed.",
                  },
                  {
                    q: "What should I bring to a class?",
                    a: "Just yourself and comfortable clothing. Mats and props are provided. You may bring your own mat if you prefer.",
                  },
                  {
                    q: "Do you offer private one-on-one sessions?",
                    a: "Yes, private sessions are available for those who prefer personalised attention or have specific needs. Contact me to arrange a time.",
                  },
                  {
                    q: "What is your cancellation policy?",
                    a: "Please provide at least 24 hours notice for cancellations. Late cancellations may incur a fee to cover the reserved spot.",
                  },
                ].map((faq, index) => (
                  <div key={index} className="bg-background rounded-xl p-6 border border-border/50">
                    <h3 className="font-heading text-lg font-medium text-foreground mb-2">
                      {faq.q}
                    </h3>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
