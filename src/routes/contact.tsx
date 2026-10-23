import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Marga Jewelry" },
      { name: "description", content: "Get in touch with Marga Jewelry for customer care, sizing, or inquiries." },
      { property: "og:title", content: "Contact Us — Marga Jewelry" },
      { property: "og:description", content: "Get in touch with Marga Jewelry." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { submitInquiry, currentUser } = useStore();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const field = "h-12 w-full rounded-lg border border-input bg-card px-4 text-sm text-charcoal outline-none focus:border-gold transition-colors";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    submitInquiry({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || "General Inquiry",
      message: message.trim(),
    });

    setSent(true);
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <div className="text-center">
        <p className="eyebrow text-gold">Client Services</p>
        <h1 className="mt-2 text-4xl text-petrol md:text-5xl">We're Here For You</h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Have questions about sizing, materials, or order status? Our concierge team is at your service.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-5 items-start">
        {/* Contact details */}
        <div className="md:col-span-2 space-y-6 rounded-2xl bg-muted/60 p-6 md:p-8">
          <div>
            <h3 className="font-serif text-xl text-petrol mb-1">Direct Concierge</h3>
            <p className="text-xs text-muted-foreground">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
          </div>

          <div className="space-y-4 text-sm text-charcoal">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-card text-gold border border-border">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">admin@margajewelry.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-card text-gold border border-border">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone & WhatsApp</p>
                <p className="font-medium">+91 98863 90483</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-card text-gold border border-border">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Studio & Showroom</p>
                <p className="font-medium">201,Pearl Castle Aparment Banaswadi, Bangalore 560033</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-3 rounded-2xl bg-card border border-border p-6 md:p-8 shadow-xs">
          {sent ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
              <h2 className="font-serif text-2xl text-petrol">Message Received</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Thank you, {name}. A member of our jewelry concierge team will respond within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setMessage("");
                  setSubject("");
                }}
                className="mt-4 inline-flex rounded-lg border border-border px-5 py-2 text-xs eyebrow text-petrol hover:bg-muted"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="font-serif text-2xl text-petrol mb-4">Send a Message</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs eyebrow text-muted-foreground">Your Name *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditi Rao"
                    className={field}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs eyebrow text-muted-foreground">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditi@example.com"
                    className={field}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order query, custom sizing, gift wrapping…"
                  className={field}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs eyebrow text-muted-foreground">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need help with…"
                  className="w-full rounded-lg border border-input bg-card p-4 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                />
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-lg bg-petrol eyebrow text-ivory hover:bg-charcoal transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
