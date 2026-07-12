import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitPublicContactLead } from "@/api/admin_leads";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact Us — Agatike Connect" }],
  }),
  component: ContactPage,
});

// Trigger router generation

function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitLead, isPending } = useMutation({
    mutationFn: submitPublicContactLead,
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    },
    onError: () => {
      alert("Something went wrong. Please try again later.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLead({
      data: {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
    } as any);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <MessageSquare className="h-4 w-4" /> We're here to help
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Contact Us</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions about Agatike Connect or want to learn more about how we can help you
              manage your next event? Reach out to our team.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-10 items-start">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-card p-8 rounded-3xl border border-border/60 shadow-[var(--shadow-card)]">
                <h3 className="text-xl font-bold mb-6">Get in touch</h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <a
                        href="mailto:hello@agatike.rw"
                        className="text-foreground hover:text-primary transition-colors font-medium"
                      >
                        hello@agatike.rw
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Headquarters</p>
                      <p className="text-foreground font-medium">Kigali, Rwanda</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border/60">
                  <p className="text-sm text-muted-foreground mb-4">
                    Agatike Connect is proudly built and maintained by <strong>Plasera</strong>.
                  </p>
                  <a
                    href="https://plas-era.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Visit Plasera →
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 bg-card p-8 md:p-10 rounded-3xl border border-border/60 shadow-[var(--shadow-card)] min-h-[400px] flex flex-col justify-center">
              {submitted ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Send className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Thank you for reaching out to us. Our team will review your message and get back to you shortly.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="rounded-full mt-4"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form
                  className="space-y-6"
                  onSubmit={handleSubmit}
                >
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input
                        id="first-name"
                        required
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="bg-background/50 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        required
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-background/50 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      required
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-background/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 rounded-xl shadow-[var(--shadow-glow)] group"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isPending ? "Sending..." : "Send Message"}
                    <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
