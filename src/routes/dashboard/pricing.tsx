import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/pricing")({
  component: DashboardPricing,
});

function DashboardPricing() {
  return (
    <div className="mx-auto max-w-5xl py-8 md:py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Upgrade to Pro</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Transparent fees. Pay only when you sell. Choose the plan that fits your growth.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
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
            className={`relative rounded-3xl border p-8 ${
              p.featured ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/60"
            } bg-card transition-all hover:scale-[1.02]`}
          >
            {p.featured && (
              <span
                className="absolute -top-3 left-8 rounded-full px-4 py-1 text-xs font-semibold tracking-wide text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Most popular
              </span>
            )}
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {p.name}
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight">{p.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <ul className="mt-8 space-y-4 text-sm font-medium">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>{" "}
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className={`mt-10 w-full rounded-xl py-6 font-semibold text-base ${
                p.featured ? "" : "bg-foreground text-background hover:bg-foreground/90"
              }`}
              style={p.featured ? { background: "var(--gradient-primary)" } : undefined}
            >
              {p.featured ? "Start Pro" : p.name === "Enterprise" ? "Contact sales" : "Get started"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
