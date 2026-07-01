import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Shield, Users } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function EventCheckoutSidebar({
  ev,
  isPastEvent,
  isExperience,
  schedules,
  tourStops,
  selectedStopIdx,
  setSelectedStopIdx,
  activeTicketTiers,
  currencyCode,
  cart,
  setCart,
  currentVenueProject,
  setActiveTicketIdForMap,
  setIsSeatModalOpen,
  total,
  totalTickets,
  selectedSeatsObj,
  attendeesCount,
}: {
  ev: any;
  isPastEvent?: boolean;
  isExperience: boolean;
  schedules: any[];
  tourStops: any[];
  selectedStopIdx: number;
  setSelectedStopIdx: (idx: number) => void;
  activeTicketTiers: any[];
  currencyCode?: string;
  cart: Record<string, number>;
  setCart: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  currentVenueProject: any;
  setActiveTicketIdForMap: (id: string) => void;
  setIsSeatModalOpen: (open: boolean) => void;
  total: number;
  totalTickets: number;
  selectedSeatsObj: any[];
  attendeesCount: number;
}) {
  const isSuspended = ev?.suspended;

  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p className="text-2xl font-semibold">
            {formatCurrency(activeTicketTiers[0]?.price || 0, currencyCode)}
          </p>
        </div>

        {!isSuspended && (
          <>
            {isExperience
              ? schedules.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Select Schedule
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {schedules.map((schedule: any, idx: number) => {
                        const totalSpots = schedule.total_spots ?? schedule.totalSpots ?? 0;
                        const spotsFilled = schedule.spots_filled ?? schedule.spotsFilled ?? 0;
                        const dateStr = schedule.start_date || schedule.date || "TBD";
                        const isFull = spotsFilled >= totalSpots;
                        return (
                          <button
                            key={schedule.id || idx}
                            onClick={() => {
                              if (!isFull) {
                                setSelectedStopIdx(idx);
                              }
                            }}
                            disabled={isFull}
                            className={`w-full px-3 py-2.5 rounded-xl text-left border transition-all ${
                              selectedStopIdx === idx
                                ? "bg-primary/10 border-primary text-foreground"
                                : isFull
                                  ? "bg-secondary/30 border-border/40 opacity-60 cursor-not-allowed"
                                  : "bg-background border-border hover:bg-secondary"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[13px]">{dateStr}</span>
                              {isFull ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                  Sold Out
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {totalSpots - spotsFilled} spots
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              : tourStops.length > 1 && (
                  <div className="mt-5">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Select Tour Stop
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {tourStops.map((stop: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedStopIdx(idx);
                          }}
                          className={`w-full px-2 py-2 rounded-xl text-[11px] leading-tight font-semibold border transition-all ${
                            selectedStopIdx === idx
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-secondary"
                          }`}
                        >
                          <span className="block truncate">{stop.city}</span>
                          <span className="block opacity-80 mt-0.5">{stop.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

            <div className="mt-5 space-y-3">
              {activeTicketTiers.map((t: any) => {
                const cartKey = `${selectedStopIdx}_${t.id}`;
                const itemQty = cart[cartKey] || 0;
                const isSelected = itemQty > 0;

                const isMapped = currentVenueProject?.sections_data?.some(
                  (s: any) => s.ticketId === t.id,
                );

                return (
                  <div
                    key={t.id}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-primary bg-accent/40"
                        : "border-border bg-background hover:bg-secondary"
                    } ${isMapped ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (isMapped) {
                        setActiveTicketIdForMap(t.id);
                        setIsSeatModalOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="font-semibold">{formatCurrency(t.price, currencyCode)}</p>
                      </div>

                      {isSuspended ? (
                        <div className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                          Suspended
                        </div>
                      ) : isMapped ? (
                        itemQty > 0 && (
                          <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                            {itemQty} Selected
                          </div>
                        )
                      ) : (
                        <div
                          className="flex items-center gap-2 bg-background rounded-full border p-1 shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() =>
                              setCart((prev) => ({ ...prev, [cartKey]: Math.max(0, itemQty - 1) }))
                            }
                            disabled={itemQty === 0}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-4 text-center text-sm font-medium">{itemQty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => setCart((prev) => ({ ...prev, [cartKey]: itemQty + 1 }))}
                            disabled={itemQty >= t.remaining}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{t.perks.join(" · ")}</p>
                    <p className="mt-1 text-xs text-primary">{t.remaining} left</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total ({totalTickets} items)</span>
              <span className="text-lg font-semibold">{formatCurrency(total, currencyCode)}</span>
            </div>
          </>
        )}

        <Button
          asChild={!isPastEvent && !isSuspended}
          disabled={isPastEvent || isSuspended || totalTickets === 0}
          className="mt-4 h-12 w-full rounded-2xl text-base shadow-[var(--shadow-glow)]"
          style={{
            background:
              isPastEvent || isSuspended
                ? "var(--muted)"
                : total === 0 && totalTickets > 0
                  ? "var(--foreground)"
                  : "var(--gradient-primary)",
            opacity: isPastEvent || isSuspended || totalTickets === 0 ? 0.5 : 1,
            pointerEvents: isPastEvent || isSuspended || totalTickets === 0 ? "none" : "auto",
            color: isPastEvent || isSuspended ? "var(--muted-foreground)" : undefined,
          }}
          onClick={() => {
            if (isPastEvent || isSuspended) return;
            localStorage.setItem(`event_checkout_${ev.id}`, JSON.stringify(cart));
            localStorage.setItem(`event_checkout_seats_${ev.id}`, JSON.stringify(selectedSeatsObj));
          }}
        >
          {isSuspended ? (
            "Event Suspended"
          ) : isPastEvent ? (
            "Event Ended"
          ) : (
            <Link to="/book/$eventId" params={{ eventId: ev.id }} className="w-full block">
              {total === 0 && totalTickets > 0 ? "Register for Free" : "Get Tickets"}
            </Link>
          )}
        </Button>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" /> Secure checkout · Mobile QR ticket
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 text-sm">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" /> {attendeesCount.toLocaleString()} going
        </span>
        <Link to="/feed" className="text-primary hover:underline">
          See moments
        </Link>
      </div>
    </aside>
  );
}
