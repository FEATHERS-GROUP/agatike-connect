import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import QRCodeImport from "react-qr-code";
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import {
  ArrowLeft,
  Ticket as TicketIcon,
  Sparkles,
  Palette,
  Type,
  Image as ImageIcon,
  Download,
  Save,
  Crown,
  Film,
  Mountain,
  Briefcase,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ticketProjects, events } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/$workspaceSlug/ticket-designer/$projectId")({
  head: () => ({
    meta: [
      { title: "Ticket Designer — Agatike" },
    ],
  }),
  component: TicketDesignerPage,
});

type Template = "concert" | "movie" | "experience" | "conference";

const templates: { id: Template; label: string; icon: any; accent: string }[] = [
  { id: "concert", label: "Concert / Event", icon: TicketIcon, accent: "#f97316" },
  { id: "movie", label: "Movie", icon: Film, accent: "#dc2626" },
  { id: "experience", label: "Experience", icon: Mountain, accent: "#16a34a" },
  { id: "conference", label: "Conference", icon: Briefcase, accent: "#0ea5e9" },
];

const palettes = [
  { name: "Sunset", from: "#f97316", to: "#db2777" },
  { name: "Midnight", from: "#0f172a", to: "#4f46e5" },
  { name: "Emerald", from: "#064e3b", to: "#10b981" },
  { name: "Noir", from: "#111111", to: "#3f3f46" },
  { name: "Royal", from: "#7c3aed", to: "#ec4899" },
  { name: "Ocean", from: "#0c2340", to: "#2d8a9e" },
];

const fonts = [
  { name: "Modern", css: "'Inter', sans-serif" },
  { name: "Editorial", css: "'Playfair Display', serif" },
  { name: "Display", css: "'Space Grotesk', sans-serif" },
  { name: "Mono", css: "'JetBrains Mono', monospace" },
];

const tiers = ["General", "VIP", "Backstage", "Early bird"];

function TicketDesignerPage() {
  const { workspaceSlug, projectId } = useParams({ from: "/dashboard/$workspaceSlug/ticket-designer/$projectId" });
  
  // Find existing project or load defaults
  const existingProject = useMemo(() => ticketProjects.find(p => p.id === projectId), [projectId]);

  // Read template from URL if it's a new project
  const searchParams = new URLSearchParams(window.location.search);
  const initialTemplate = searchParams.get("template") as Template || "concert";

  const [projectName, setProjectName] = useState(existingProject?.name || "Untitled Project");
  const [eventId, setEventId] = useState(existingProject?.eventId || "");
  
  const [template, setTemplate] = useState<Template>(existingProject?.template || initialTemplate);
  const [palette, setPalette] = useState(existingProject?.palette || palettes[0]);
  const [font, setFont] = useState(existingProject?.font || fonts[0]);
  const [tier, setTier] = useState(existingProject?.tier || "VIP");
  const [title, setTitle] = useState(existingProject?.title || "Afrobeats Night Live");
  const [subtitle, setSubtitle] = useState(existingProject?.subtitle || "Eko Convention Centre · Lagos");
  const [date, setDate] = useState(existingProject?.date || "Sat, 14 Sep 2026");
  const [time, setTime] = useState(existingProject?.time || "21:00");
  const [seat, setSeat] = useState(existingProject?.seat || "Sec A · Row 12 · Seat 36");
  const [price, setPrice] = useState(existingProject?.price || "85");
  const [currency, setCurrency] = useState(existingProject?.currency || "$");
  const [cover, setCover] = useState<string>(existingProject?.cover || "");
  const [logoText, setLogoText] = useState(existingProject?.logoText || "AGATIKE");

  const orderId = useMemo(
    () => "AGT-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    [],
  );

  const onUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCover(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // In a real app this would call an API to save
    console.log("Saving project", { projectId, projectName, eventId, template, title });
    alert("Project saved successfully!");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link to={`/dashboard/${workspaceSlug}/ticket-designer`} className="rounded-full p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Ticket Projects / Editor</p>
            <Input 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              className="h-7 px-1 py-0 border-transparent hover:border-border/60 focus:border-primary focus-visible:ring-0 shadow-none bg-transparent font-semibold text-lg sm:w-64 md:w-80"
              placeholder="Name this project..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <Download className="mr-1 h-4 w-4" /> Export PDF
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Save className="mr-1 h-4 w-4" /> Save project
          </Button>
        </div>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
        {/* Controls */}
        <aside className="space-y-6">
          <Section title="Assignment" icon={Calendar}>
            <Field label="Assign to Event">
              <select 
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">-- No Event Assigned --</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Template" icon={Sparkles}>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${
                    template === t.id
                      ? "border-primary bg-accent/40"
                      : "border-border/60 hover:bg-secondary"
                  }`}
                >
                  <t.icon className="h-4 w-4 text-primary" /> {t.label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Palette" icon={Palette}>
            <div className="grid grid-cols-3 gap-2">
              {palettes.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPalette(p)}
                  className={`h-14 rounded-xl border-2 transition ${
                    palette.name === p.name ? "border-primary" : "border-transparent"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                  title={p.name}
                />
              ))}
            </div>
          </Section>

          <Section title="Typography" icon={Type}>
            <div className="grid grid-cols-2 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFont(f)}
                  style={{ fontFamily: f.css }}
                  className={`rounded-xl border p-3 text-left text-sm ${
                    font.name === f.name ? "border-primary bg-accent/40" : "border-border/60"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">{f.name}</p>
                  <p className="font-semibold">Aa Bb 123</p>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Tier" icon={Crown}>
            <div className="flex flex-wrap gap-2">
              {tiers.map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    tier === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Content" icon={TicketIcon}>
            <div className="space-y-3">
              <Field label="Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Subtitle / Venue">
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Time">
                  <Input value={time} onChange={(e) => setTime(e.target.value)} />
                </Field>
              </div>
              <Field label="Seat / Section">
                <Input value={seat} onChange={(e) => setSeat(e.target.value)} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Currency">
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
                </Field>
                <Field label="Price">
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="col-span-2"
                  />
                </Field>
                <Field label="Brand">
                  <Input value={logoText} onChange={(e) => setLogoText(e.target.value)} />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Cover image" icon={ImageIcon}>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground hover:bg-secondary">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
              {cover ? "Replace cover" : "Drop image or click to upload"}
            </label>
          </Section>
        </aside>

        {/* Preview */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Live preview
                </p>
                <h3 className="text-lg font-semibold">{tier} · {template}</h3>
              </div>
              <div className="flex gap-2 text-xs">
                {["Front", "Back", "Mobile"].map((v, i) => (
                  <button
                    key={v}
                    className={`rounded-full px-3 py-1 ${i === 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <TicketPreview
                template={template}
                palette={palette}
                font={font}
                tier={tier}
                title={title}
                subtitle={subtitle}
                date={date}
                time={time}
                seat={seat}
                price={price}
                currency={currency}
                cover={cover}
                logoText={logoText}
                orderId={orderId}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {["Email", "Mobile wallet", "Print PDF"].map((c) => (
              <div
                key={c}
                className="rounded-2xl border border-border/60 bg-card p-5 text-sm"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Channel</p>
                <p className="mt-1 font-semibold">{c}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Auto-formatted for the perfect render in {c.toLowerCase()}.
                </p>
                <Button variant="outline" className="mt-4 w-full rounded-full">
                  Preview
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function TicketPreview(props: {
  template: Template;
  palette: { from: string; to: string; name: string };
  font: { css: string; name: string };
  tier: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  seat: string;
  price: string;
  currency: string;
  cover: string;
  logoText: string;
  orderId: string;
}) {
  const {
    palette,
    font,
    tier,
    title,
    subtitle,
    date,
    time,
    seat,
    price,
    currency,
    cover,
    logoText,
    orderId,
    template,
  } = props;

  return (
    <div
      className="relative flex w-[720px] max-w-full overflow-hidden rounded-[28px] text-white shadow-2xl transition-all"
      style={{
        fontFamily: font.css,
        background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
      }}
    >
      {/* Cover */}
      <div className="relative flex-1 p-7">
        {cover && (
          <img
            src={cover}
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md">
              {tier} · {template}
            </span>
            <span className="text-sm font-black tracking-[0.3em]">{logoText}</span>
          </div>

          <div>
            <h2 className="text-3xl font-black leading-tight drop-shadow">{title}</h2>
            <p className="mt-1 text-sm text-white/80">{subtitle}</p>
          </div>

          <div className="grid grid-cols-4 gap-3 text-[11px]">
            <Cell label="Date" value={date} />
            <Cell label="Time" value={time} />
            <Cell label="Seat" value={seat} />
            <Cell label="Price" value={`${currency}${price}`} />
          </div>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative w-px">
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
        <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-card" />
        <div className="h-full w-px border-l-2 border-dashed border-white/40" />
      </div>

      {/* Stub */}
      <div className="flex w-[200px] flex-col items-center justify-between bg-black/30 p-6 text-center backdrop-blur-md">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/70">Admit One</p>
          <p className="mt-1 text-xs font-mono">{orderId}</p>
        </div>
        <div className="rounded-xl bg-white p-2">
          <QRCode value={orderId} size={110} />
        </div>
        <p className="text-[10px] text-white/70">Scan at entrance</p>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 p-2 backdrop-blur-md border border-white/10">
      <p className="text-[9px] uppercase tracking-widest text-white/70">{label}</p>
      <p className="mt-0.5 text-xs font-bold">{value}</p>
    </div>
  );
}
