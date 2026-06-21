import { CheckCircle2 } from "lucide-react";

export function EventIncluded({
  isExperience,
  included,
}: {
  isExperience: boolean;
  included: any[];
}) {
  if (!isExperience || included.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold">What's Included</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {included.map((item: any, idx: number) => {
          const title = typeof item === "string" ? item : item.title;
          const description = typeof item === "string" ? null : item.description;
          return (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm">{title}</p>
                {description && (
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
