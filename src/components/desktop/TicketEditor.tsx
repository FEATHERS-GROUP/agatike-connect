import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Ticket = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "paid" | "free" | "early" | "vip";
  sale_ends_at?: string;
  includes?: string[];
  tour_stop_idx?: number | null;
  form_id?: string;
  vip_privilege_ids?: string[];
};

function generateId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

export function TicketEditor({
  tickets,
  setTickets,
  currencySymbol,
  locations,
  sameTicketsForAllLocations,
  setSameTicketsForAllLocations,
  activeTourStopIdx,
  setActiveTourStopIdx,
  forms = [],
  vipPrivileges = [],
}: {
  tickets: Ticket[];
  setTickets: (t: Ticket[]) => void;
  currencySymbol: string;
  locations: any[];
  sameTicketsForAllLocations: boolean;
  setSameTicketsForAllLocations: (val: boolean) => void;
  activeTourStopIdx: number;
  setActiveTourStopIdx: (val: number) => void;
  forms?: any[];
  forms?: any[];
  vipPrivileges?: any[];
  canCreateTicketTier?: (currentTiersCount: number) => boolean;
}) {
  const displayedTickets = tickets.filter((t) =>
    sameTicketsForAllLocations ? true : t.tour_stop_idx === activeTourStopIdx,
  );

  const add = (type: Ticket["type"]) =>
    setTickets([
      ...tickets,
      {
        id: generateId(),
        name:
          type === "free"
            ? "Free RSVP"
            : type === "vip"
              ? "VIP"
              : type === "early"
                ? "Early Bird"
                : "Paid Ticket",
        price: type === "free" ? 0 : type === "vip" ? 95 : 25,
        quantity: 100,
        type,
        tour_stop_idx: sameTicketsForAllLocations ? null : activeTourStopIdx,
      },
    ]);

  const update = (id: string, patch: Partial<Ticket>) =>
    setTickets(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-6">
      {locations.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-secondary/20 p-5">
          <div>
            <Label className="text-base font-semibold">Location-Specific Tickets</Label>
            <p className="text-sm text-muted-foreground">
              Do you want different ticket tiers or prices per location?
            </p>
          </div>
          <div className="flex bg-secondary p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                setSameTicketsForAllLocations(true);
                setTickets(tickets.map((t) => ({ ...t, tour_stop_idx: null })));
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${sameTicketsForAllLocations ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Same for all
            </button>
            <button
              type="button"
              onClick={() => {
                setSameTicketsForAllLocations(false);
                setTickets(tickets.map((t) => ({ ...t, tour_stop_idx: activeTourStopIdx })));
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${!sameTicketsForAllLocations ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Set up per location
            </button>
          </div>
        </div>
      )}

      {locations.length > 1 && !sameTicketsForAllLocations && (
        <div className="flex items-center gap-2 border-b border-border/60 pb-4 overflow-x-auto">
          {locations.map((loc: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTourStopIdx(idx)}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeTourStopIdx === idx ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"}`}
            >
              {loc.venue || loc.city || `Location ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["paid", "free", "early", "vip"] as const).map((t) => (
          <Button
            key={t}
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              if (canCreateTicketTier && !canCreateTicketTier(displayedTickets.length)) {
                toast.error("Ticket Tier Limit Reached", {
                  description:
                    "You have reached the maximum number of ticket tiers for this event. Please upgrade to create more.",
                });
                return;
              }
              add(t);
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />{" "}
            {t === "paid" ? "Paid" : t === "free" ? "Free" : t === "early" ? "Early bird" : "VIP"}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {displayedTickets.map((t) => (
          <div
            key={t.id}
            className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4 md:grid-cols-[1fr_120px_120px_auto] items-end"
          >
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Ticket Name</Label>
              <Input
                value={t.name}
                onChange={(e) => update(t.id, { name: e.target.value })}
                placeholder="Ticket name"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Price ({currencySymbol.trim()})
              </Label>
              <Input
                type="number"
                value={t.price}
                onChange={(e) => update(t.id, { price: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Quantity</Label>
              <Input
                type="number"
                value={t.quantity}
                onChange={(e) => update(t.id, { quantity: Number(e.target.value) })}
                placeholder="100"
              />
            </div>
            {t.type === "early" && (
              <div className="md:col-span-full">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Early Bird Ends At
                </Label>
                <Input
                  type="datetime-local"
                  value={t.sale_ends_at || ""}
                  onChange={(e) => update(t.id, { sale_ends_at: e.target.value })}
                  className="w-full sm:w-auto"
                />
              </div>
            )}
            <div className="md:col-span-full">
              <Label className="text-xs text-muted-foreground mb-1 block">What's Included</Label>
              <div className="space-y-2">
                {(t.includes || [""]).map((inc: string, incIdx: number) => (
                  <div key={incIdx} className="flex items-center gap-2">
                    <Input
                      value={inc}
                      onChange={(e) => {
                        const newIncludes = [...(t.includes || [""])];
                        newIncludes[incIdx] = e.target.value;
                        update(t.id, { includes: newIncludes });
                      }}
                      placeholder="e.g. Backstage access"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        const newIncludes = [...(t.includes || [""])];
                        newIncludes.splice(incIdx, 1);
                        update(t.id, { includes: newIncludes });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 text-primary hover:text-primary/80"
                onClick={() => {
                  update(t.id, { includes: [...(t.includes || []), ""] });
                }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add included item
              </Button>
            </div>
            {(t.price === 0 || t.type === "free") && forms.length > 0 && (
              <div className="md:col-span-full">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Attach Registration Form (Optional)
                </Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={t.form_id || ""}
                  onChange={(e) => update(t.id, { form_id: e.target.value })}
                >
                  <option value="">No form (Standard checkout)</option>
                  {forms.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {vipPrivileges.length > 0 && (
              <div className="md:col-span-full mt-2 border-t border-border/40 pt-2">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  VIP Privileges & Perks
                </Label>
                <div className="flex flex-wrap gap-2">
                  {vipPrivileges.map((privilege: any) => {
                    const isSelected = t.vip_privilege_ids?.includes(privilege.id);
                    return (
                      <div
                        key={privilege.id}
                        className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          isSelected
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-background border-border/60 text-muted-foreground hover:border-primary/50"
                        }`}
                        onClick={() => {
                          const currentIds = t.vip_privilege_ids || [];
                          if (isSelected) {
                            update(t.id, {
                              vip_privilege_ids: currentIds.filter((id) => id !== privilege.id),
                            });
                          } else {
                            update(t.id, { vip_privilege_ids: [...currentIds, privilege.id] });
                          }
                        }}
                      >
                        {privilege.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="mb-1"
              onClick={() => setTickets(tickets.filter((x) => x.id !== t.id))}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        {displayedTickets.length === 0 && (
          <p className="text-sm text-muted-foreground">No tickets yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
