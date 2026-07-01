// Force rebuild
import { ChevronUp, Plus, Minus, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useNavigate, Link } from "@tanstack/react-router";

export function EventCheckoutDrawer({
  ev,
  isPastEvent,
  isExperience,
  schedules,
  tourStops,
  selectedStopIdx,
  setSelectedStopIdx,
  hasSelectedStop,
  setHasSelectedStop,
  isTicketsExpanded,
  setIsTicketsExpanded,
  isSeatModalOpen,
  setIsSeatModalOpen,
  activeTicketTiers,
  currencyCode,
  cart,
  setCart,
  currentVenueProject,
  setActiveTicketIdForMap,
  total,
  totalTickets,
  selectedSeatsObj,
  isUpcoming,
  waitlistUrl,
  timerDate,
}: {
  ev: any;
  isPastEvent?: boolean;
  isExperience: boolean;
  schedules: any[];
  tourStops: any[];
  selectedStopIdx: number;
  setSelectedStopIdx: (idx: number) => void;
  hasSelectedStop: boolean;
  setHasSelectedStop: (val: boolean) => void;
  isTicketsExpanded: boolean;
  setIsTicketsExpanded: (val: boolean) => void;
  isSeatModalOpen: boolean;
  setIsSeatModalOpen: (val: boolean) => void;
  activeTicketTiers: any[];
  currencyCode?: string;
  cart: Record<string, number>;
  setCart: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  currentVenueProject: any;
  setActiveTicketIdForMap: (id: string) => void;
  total: number;
  selectedSeatsObj: any[];
  isUpcoming?: boolean;
  waitlistUrl?: string;
  timerDate?: string;
}) {
  const navigate = useNavigate();
  const isSuspended = ev?.suspended;

  return (
    <>
      {/* Backdrop for Expanded Tickets */}
      {isTicketsExpanded && !isSeatModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-in fade-in duration-300"
          onClick={() => setIsTicketsExpanded(false)}
        />
      )}

      {/* Sticky Bottom Action & Collapsible Tickets Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border/50 z-40 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)] transition-transform duration-300 ${isSeatModalOpen ? "hidden" : ""}`}
      >
        <div className="max-w-md mx-auto w-full">
          {isUpcoming ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Coming Soon</h3>
                  {timerDate && <p className="text-sm text-muted-foreground">Dropping {new Date(timerDate).toLocaleDateString("en-US")}</p>}
                </div>
              </div>
              <Button
                asChild={!!waitlistUrl}
                disabled={!waitlistUrl}
                className="w-full h-12 rounded-xl text-sm font-bold shadow-[var(--shadow-glow)] tracking-wide"
                style={{ background: waitlistUrl ? "var(--gradient-primary)" : "var(--muted)", color: waitlistUrl ? undefined : "var(--muted-foreground)" }}
              >
                {waitlistUrl ? (
                  waitlistUrl.startsWith("/") ? (
                    <Link to={waitlistUrl} className="w-full block text-center leading-[48px]">
                      Join Waitlist / RSVP
                    </Link>
                  ) : (
                    <a href={waitlistUrl} target="_blank" rel="noreferrer" className="w-full block text-center leading-[48px]">
                      Join Waitlist / RSVP
                    </a>
                  )
                ) : (
                  <span className="w-full block text-center leading-[48px]">Tickets Coming Soon</span>
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* Collapsible Header/Toggle */}
              <div
                className={`flex items-center justify-between gap-4 mb-3 transition-opacity ${isPastEvent ? "opacity-50" : "cursor-pointer active:opacity-70"}`}
                onClick={() => {
                  if (!isPastEvent) setIsTicketsExpanded(!isTicketsExpanded);
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground font-semibold">Tickets & Pricing</span>
                  <ChevronUp
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isTicketsExpanded ? "rotate-180" : ""}`}
                  />
                </div>
                {!isTicketsExpanded && activeTicketTiers.length > 1 && (
                  <span className="text-xs text-primary font-bold">
                    Show {activeTicketTiers.length - 1} more options
                  </span>
                )}
              </div>

              {/* Schedule/Tour Stops selection */}
              {!isSuspended &&
                isTicketsExpanded &&
                (isExperience ? schedules.length > 1 : tourStops.length > 1) && (
                  <div className="mb-4 border-t border-border/40 pt-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {isExperience ? "Select Schedule" : "Select Tour Stop"}
                    </p>
                    <div
                      className={`flex ${hasSelectedStop ? "gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x" : "flex-col gap-3"}`}
                    >
                      {(isExperience ? schedules : tourStops).map(
                        (stopOrSchedule: any, idx: number) => {
                          const isSelected = selectedStopIdx === idx;

                          if (isExperience) {
                            const totalSpots =
                              stopOrSchedule.total_spots ?? stopOrSchedule.totalSpots ?? 0;
                            const spotsFilled =
                              stopOrSchedule.spots_filled ?? stopOrSchedule.spotsFilled ?? 0;
                            const dateStr = stopOrSchedule.start_date || stopOrSchedule.date || "TBD";
                            const isFull = spotsFilled >= totalSpots;

                            if (hasSelectedStop && !isSelected) {
                              return (
                                <button
                                  key={idx}
                                  onClick={() => !isFull && setSelectedStopIdx(idx)}
                                  disabled={isFull}
                                  className={`relative snap-start flex flex-col items-start min-w-[160px] p-3.5 rounded-2xl border transition-all duration-300 shrink-0 text-left bg-card border-border/40 hover:border-border hover:bg-secondary/30 opacity-70 ${isFull ? "cursor-not-allowed grayscale" : ""}`}
                                >
                                  <div className="flex items-center justify-between w-full">
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
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (!isFull) {
                                    setSelectedStopIdx(idx);
                                    setHasSelectedStop(true);
                                  }
                                }}
                                disabled={isFull}
                                className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left ${
                                  isSelected && hasSelectedStop
                                    ? "bg-primary/10 border-primary shadow-[0_4px_20px_rgba(var(--primary),0.15)] ring-1 ring-primary/20 snap-start min-w-[160px] shrink-0"
                                    : "bg-card/50 border-border/60 hover:bg-card w-full"
                                } ${isFull ? "cursor-not-allowed opacity-60" : ""}`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span
                                    className={`font-semibold text-sm ${isSelected && hasSelectedStop ? "text-foreground" : "text-foreground/90"}`}
                                  >
                                    {dateStr}
                                  </span>
                                  {isFull ? (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                      Sold Out
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      {totalSpots - spotsFilled} spots left
                                    </span>
                                  )}
                                </div>
                                {isSelected && hasSelectedStop && (
                                  <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),1)]" />
                                )}
                              </button>
                            );
                          }

                          const stop = stopOrSchedule;
                          if (hasSelectedStop && !isSelected) {
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedStopIdx(idx)}
                                className="relative snap-start flex flex-col items-start min-w-[160px] p-3.5 rounded-2xl border transition-all duration-300 shrink-0 text-left bg-card border-border/40 hover:border-border hover:bg-secondary/30 opacity-70"
                              >
                                <div className="flex items-center gap-2 mb-1 w-full">
                                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  <span className="text-sm font-bold truncate text-foreground/80">
                                    {stop.venue || stop.city || `Stop ${idx + 1}`}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 shrink-0" />
                                    {stop.date || "TBD"}
                                  </span>
                                  {stop.time && (
                                    <span className="text-[10px] font-medium text-muted-foreground/80 flex items-center gap-1.5 ml-0.5">
                                      <Clock className="h-2.5 w-2.5 shrink-0" />
                                      {stop.time}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedStopIdx(idx);
                                setHasSelectedStop(true);
                              }}
                              className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left ${
                                isSelected && hasSelectedStop
                                  ? "bg-primary/10 border-primary shadow-[0_4px_20px_rgba(var(--primary),0.15)] ring-1 ring-primary/20 snap-start min-w-[160px] shrink-0"
                                  : "bg-card/50 border-border/60 hover:bg-card w-full"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1 w-full">
                                <MapPin
                                  className={`h-4 w-4 shrink-0 ${isSelected && hasSelectedStop ? "text-primary" : "text-muted-foreground"}`}
                                />
                                <span
                                  className={`text-sm font-bold ${isSelected && hasSelectedStop ? "text-foreground" : "text-foreground/90"}`}
                                >
                                  {stop.venue || stop.city || `Stop ${idx + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  {stop.date || "TBD"}
                                </span>
                                {stop.time && (
                                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                    {stop.time}
                                  </span>
                                )}
                              </div>
                              {isSelected && hasSelectedStop && (
                                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),1)]" />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

              {/* Tickets List */}
              {!isSuspended && isTicketsExpanded && hasSelectedStop && (
                <div className="max-h-[35vh] overflow-y-auto space-y-2.5 pr-1 border-t border-border/40 pt-3 mb-4 scrollbar-hide animate-in slide-in-from-bottom-2 fade-in duration-200">
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
                        className={`w-full rounded-2xl border p-3.5 transition-all duration-300 ${isSelected ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"} ${isMapped ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (isMapped) {
                            setActiveTicketIdForMap(t.id);
                            setIsSeatModalOpen(true);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-sm">{t.name}</p>
                          <p className="font-bold text-base text-primary">
                            {formatCurrency(t.price, currencyCode)}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {t.perks.join(" · ")}
                        </p>
                        <p className="text-[11px] font-medium text-primary mt-1 mb-3">
                          {t.remaining} left
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                          <span className="text-xs font-medium text-muted-foreground">Quantity</span>
                          {isSuspended ? (
                            <div className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                              Suspended
                            </div>
                          ) : isMapped ? (
                            itemQty > 0 && (
                              <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {itemQty} Selected
                              </div>
                            )
                          ) : (
                            <div
                              className="flex items-center gap-3 bg-background rounded-full px-2 py-1 shadow-sm border border-border/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                                onClick={() =>
                                  setCart((prev) => ({ ...prev, [cartKey]: Math.max(0, itemQty - 1) }))
                                }
                                disabled={itemQty === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-4 text-center font-bold text-xs">{itemQty}</span>
                              <button
                                className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                                onClick={() => setCart((prev) => ({ ...prev, [cartKey]: itemQty + 1 }))}
                                disabled={itemQty >= t.remaining}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* If minimized, show exactly one ticket option */}
              {!isSuspended &&
                !isTicketsExpanded &&
                hasSelectedStop &&
                activeTicketTiers.length > 0 && (
                  <div className="mb-4 border-t border-border/40 pt-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    {activeTicketTiers.slice(0, 1).map((t: any) => {
                      const cartKey = `${selectedStopIdx}_${t.id}`;
                      const itemQty = cart[cartKey] || 0;
                      const isSelected = itemQty > 0;
                      const isMapped = currentVenueProject?.sections_data?.some(
                        (s: any) => s.ticketId === t.id,
                      );

                      return (
                        <div
                          key={t.id}
                          className={`w-full rounded-2xl border p-3.5 transition-all duration-300 ${isSelected ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"} ${isMapped ? "cursor-pointer" : ""}`}
                          onClick={() => {
                            if (isMapped) {
                              setActiveTicketIdForMap(t.id);
                              setIsSeatModalOpen(true);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm">{t.name}</p>
                            <p className="font-bold text-base text-primary">
                              {formatCurrency(t.price, currencyCode)}
                            </p>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {t.perks.join(" · ")}
                          </p>
                          <p className="text-[11px] font-medium text-primary mt-1 mb-3">
                            {t.remaining} left
                          </p>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                            <span className="text-xs font-medium text-muted-foreground">Quantity</span>
                            {isSuspended ? (
                              <div className="bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                                Suspended
                              </div>
                            ) : isMapped ? (
                              itemQty > 0 && (
                                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {itemQty} Selected
                                </div>
                              )
                            ) : (
                              <div
                                className="flex items-center gap-3 bg-background rounded-full px-2 py-1 shadow-sm border border-border/20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                                  onClick={() =>
                                    setCart((prev) => ({
                                      ...prev,
                                      [cartKey]: Math.max(0, itemQty - 1),
                                    }))
                                  }
                                  disabled={itemQty === 0}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-4 text-center font-bold text-xs">{itemQty}</span>
                                <button
                                  className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                                  onClick={() =>
                                    setCart((prev) => ({ ...prev, [cartKey]: itemQty + 1 }))
                                  }
                                  disabled={itemQty >= t.remaining}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Action Row */}
              <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border/30">
                {!isSuspended && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Total ({totalTickets} items)
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {formatCurrency(total, currencyCode)}
                    </span>
                  </div>
                )}
                <Button
                  className="flex-1 h-12 rounded-xl text-sm font-bold shadow-[var(--shadow-glow)] tracking-wide"
                  style={{
                    background:
                      isPastEvent || isSuspended
                        ? "var(--muted)"
                        : total === 0 && totalTickets > 0
                          ? "var(--foreground)"
                          : "var(--gradient-primary)",
                    opacity:
                      isPastEvent || isSuspended || (totalTickets === 0 && hasSelectedStop) ? 0.5 : 1,
                    pointerEvents:
                      isPastEvent || isSuspended || (totalTickets === 0 && hasSelectedStop)
                        ? "none"
                        : "auto",
                    color: isPastEvent || isSuspended ? "var(--muted-foreground)" : undefined,
                  }}
                  onClick={() => {
                    if (isPastEvent || isSuspended) return;
                    if (!hasSelectedStop) {
                      setIsTicketsExpanded(true);
                      return;
                    }
                    if (totalTickets > 0) {
                      localStorage.setItem(`event_checkout_${ev.id}`, JSON.stringify(cart));
                      localStorage.setItem(
                        `event_checkout_seats_${ev.id}`,
                        JSON.stringify(selectedSeatsObj),
                      );
                      navigate({
                        to: "/book/$eventId",
                        params: { eventId: ev.id },
                      });
                    }
                  }}
                >
                  <span className="w-full block text-center leading-[48px]">
                    {isSuspended
                      ? "Event Suspended"
                      : isPastEvent
                        ? "Event Ended"
                        : !hasSelectedStop
                          ? "Select Date"
                          : total === 0 && totalTickets > 0
                            ? "Register for Free"
                            : "Get Tickets"}
                  </span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
