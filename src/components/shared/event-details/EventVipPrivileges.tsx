import { Crown, CarFront, Star, Wine, Ticket } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  Crown: <Crown className="w-5 h-5 text-primary shrink-0" />,
  CarFront: <CarFront className="w-5 h-5 text-primary shrink-0" />,
  Star: <Star className="w-5 h-5 text-primary shrink-0" />,
  Wine: <Wine className="w-5 h-5 text-primary shrink-0" />,
  Ticket: <Ticket className="w-5 h-5 text-primary shrink-0" />,
};

export function EventVipPrivileges({
  vipPrivileges,
  vipPerks,
}: {
  vipPrivileges: any[];
  vipPerks?: string;
}) {
  if (vipPrivileges.length === 0 && !vipPerks) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Crown className="w-5 h-5 text-primary" /> VIP Privileges
      </h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {vipPrivileges.map((privilege: any) => (
          <div
            key={privilege.id}
            className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
          >
            {ICONS[privilege.icon] || <Crown className="w-5 h-5 text-primary shrink-0" />}
            <div>
              <p className="font-semibold text-sm">{privilege.name}</p>
              {privilege.description && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {privilege.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {vipPerks && (
        <div className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {vipPerks}
        </div>
      )}
    </div>
  );
}
