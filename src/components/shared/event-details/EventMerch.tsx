import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

export function EventMerch({
  activeMerch,
  currencyCode,
}: {
  activeMerch: any[];
  currencyCode?: string;
}) {
  if (activeMerch.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold">Merchandise & add-ons</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {activeMerch.map((m: any) => (
          <div key={m.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <img
              src={m.image}
              alt={m.name}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <p className="text-sm font-medium">{m.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {formatCurrency(m.price, currencyCode)}
                </span>
                <Button size="sm" variant="outline" className="rounded-full">
                  Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
