import { Button } from "@/components/ui/button";

export function DesktopWizardPreview() {
  return (
    <section className="mt-12 rounded-3xl border border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Create event</h2>
          <p className="text-sm text-muted-foreground">
            A 7-step wizard, designed for speed.
          </p>
        </div>
        <Button className="rounded-full" style={{ background: "var(--gradient-primary)" }}>
          Resume draft
        </Button>
      </div>
      <ol className="mt-6 grid gap-3 md:grid-cols-7">
        {["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP access", "Publish"].map(
          (s, i) => (
            <li
              key={s}
              className={`rounded-2xl border p-3 text-xs ${i < 3 ? "border-primary bg-accent/40" : "border-border/60 bg-background"}`}
            >
              <p className="text-muted-foreground">Step {i + 1}</p>
              <p className="mt-1 font-medium text-foreground">{s}</p>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}
