import { Button } from "@/components/ui/button";

export function DesktopPricing() {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pricing</h2>
          <p className="text-sm text-muted-foreground">Transparent fees. Pay only when you sell.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          {
            name: "Free",
            price: "$0",
            desc: "Up to 30 attendees",
            features: ["Free scanning", "Free withdrawals", "Email support"],
          },
          {
            name: "Pro",
            price: "$29/mo",
            featured: true,
            desc: "For growing organizers",
            features: [
              "Branded event pages",
              "Marketing tools",
              "Advanced analytics",
              "Priority support",
            ],
          },
          {
            name: "Enterprise",
            price: "Custom",
            desc: "Stadiums, festivals, conferences",
            features: [
              "Dedicated success team",
              "API access",
              "Custom integrations",
              "On-site staff",
            ],
          },
        ].map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl border p-6 ${p.featured ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/60"} bg-card`}
          >
            {p.featured && (
              <span
                className="absolute -top-3 left-6 rounded-full px-3 py-1 text-xs text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Most popular
              </span>
            )}
            <p className="text-sm text-muted-foreground">{p.name}</p>
            <p className="mt-1 text-3xl font-semibold">{p.price}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-primary">
                    ✓
                  </span>{" "}
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className={`mt-6 w-full rounded-full ${p.featured ? "" : "bg-foreground text-background hover:bg-foreground/90"}`}
              style={p.featured ? { background: "var(--gradient-primary)" } : undefined}
            >
              {p.featured ? "Start Pro" : p.name === "Enterprise" ? "Contact sales" : "Get started"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
