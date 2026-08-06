import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, Ticket, Building2, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingsTabProps {
  myResourceBookings: any[];
  setActiveTab: (tab: string) => void;
  isLoading?: boolean;
}

export function BookingsTab({ myResourceBookings, setActiveTab, isLoading }: BookingsTabProps) {
  return (
    <div className="bg-card border border-border/40 rounded-[32px] md:rounded-3xl p-6 md:p-8 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="mb-6 md:mb-8 max-w-xl">
        <h3 className="text-xl md:text-2xl font-bold mb-2">My Bookings</h3>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Manage your upcoming and past reservations for resources and classes.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : myResourceBookings?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {myResourceBookings.map((b: any) => {
            const isConfirmed = b.status?.toLowerCase() === "confirmed";
            return (
              <div
                key={b.id}
                className="group relative bg-secondary/5 rounded-2xl md:rounded-[24px] p-5 md:p-6 border border-border/40 hover:border-primary/50 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between h-full"
              >
                {/* Status Indicator Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${isConfirmed ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]" : "bg-primary"}`}
                />

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-background border border-border/40 flex items-center justify-center shadow-sm">
                      {b.resource?.type === "desk" ? (
                        <User className="w-5 h-5 text-primary" />
                      ) : b.resource ? (
                        <Building2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Ticket className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
                        {b.title || "Reservation"}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground font-medium">
                        {b.resource?.name || "Class Session"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isConfirmed
                        ? "bg-orange-500/10 text-orange-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex items-center gap-4 text-xs md:text-sm font-semibold text-foreground">
                    <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border/40 shadow-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(b.start_time), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border/40 shadow-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(b.start_time), "HH:mm")}
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 md:py-20 bg-secondary/10 rounded-2xl md:rounded-3xl border border-dashed border-border/40 max-w-2xl mx-auto">
          <Ticket className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-semibold text-lg md:text-xl">
            You have no bookings yet.
          </p>
          <p className="text-sm md:text-base text-muted-foreground/70 mt-2 mb-8 px-4">
            Secure your workspace, equipment, or class spot for your next visit.
          </p>
          <Button
            className="rounded-xl font-bold px-8 h-12"
            onClick={() => setActiveTab("resources")}
          >
            Book a Resource
          </Button>
        </div>
      )}
    </div>
  );
}
