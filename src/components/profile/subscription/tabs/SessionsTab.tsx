import React, { useMemo } from "react";
import { format, isSameDay, addDays, startOfDay } from "date-fns";
import { Calendar, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionsTabProps {
  sessions: any[];
  onBookSession: (session: any) => void;
  space: any;
}

export function SessionsTab({ sessions, onBookSession, space }: SessionsTabProps) {
  const groupedSessions = useMemo(() => {
    if (!sessions) return [];
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    const groups: { date: Date; sessions: any[] }[] = [];
    sortedSessions.forEach((session) => {
      const sessionDate = startOfDay(new Date(session.start_time));
      const existingGroup = groups.find((g) => isSameDay(g.date, sessionDate));
      if (existingGroup) {
        existingGroup.sessions.push(session);
      } else {
        groups.push({ date: sessionDate, sessions: [session] });
      }
    });
    return groups;
  }, [sessions]);

  return (
    <div className="bg-card border border-border/40 rounded-[32px] md:rounded-3xl p-5 md:p-8 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="w-full space-y-6 md:space-y-8">
        {!sessions || sessions.length === 0 ? (
          <div className="text-center py-12 md:py-24 bg-secondary/10 rounded-3xl border border-dashed border-border/40">
            <Calendar className="h-10 w-10 md:h-16 md:w-16 text-muted-foreground/30 mx-auto mb-3 md:mb-6" />
            <p className="text-muted-foreground font-semibold text-lg md:text-2xl">
              No upcoming sessions
            </p>
            <p className="text-sm md:text-base text-muted-foreground/70 mt-1">
              Check back later for new classes and events.
            </p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-12">
            {groupedSessions.map((group, groupIdx) => (
              <div key={groupIdx} className="relative">
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur py-2 md:py-4 border-b border-border/20 mb-4 md:mb-6 flex items-center justify-between">
                  <h3 className="text-base md:text-xl font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {isSameDay(group.date, new Date())
                      ? "Today"
                      : isSameDay(group.date, addDays(new Date(), 1))
                        ? "Tomorrow"
                        : format(group.date, "EEEE, MMM d")}
                  </h3>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">
                    {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {group.sessions.map((session, idx) => {
                    const isCompleted = new Date(session.end_time) < new Date();
                    return (
                      <div
                        key={idx}
                        className="group flex flex-col sm:flex-row bg-background border border-border/40 rounded-2xl md:rounded-[24px] overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="bg-secondary/10 px-4 md:px-6 py-4 border-b sm:border-b-0 sm:border-r border-border/40 flex sm:flex-col items-center sm:justify-center justify-between min-w-[120px] md:min-w-[140px] shrink-0">
                          <div className="text-center">
                            <p className="text-sm md:text-lg font-black text-foreground">
                              {format(new Date(session.start_time), "HH:mm")}
                            </p>
                            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {format(new Date(session.start_time), "a")}
                            </p>
                          </div>
                          <div className="hidden sm:block w-px h-6 bg-border/40 my-2" />
                          <div className="text-center">
                            <p className="text-xs md:text-sm font-bold text-muted-foreground">
                              {format(new Date(session.end_time), "HH:mm")}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 md:p-6 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-2 md:space-y-3 flex-1">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded text-primary bg-primary/10 uppercase tracking-wider">
                                  {session.class?.duration_minutes} Min
                                </span>
                                {session.class?.is_free_with_subscription ? (
                                  <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded text-green-500 bg-green-500/10 flex items-center gap-1">
                                    Included
                                  </span>
                                ) : (
                                  <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 rounded text-orange-500 bg-orange-500/10 flex items-center gap-1">
                                    Extra Fee
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {session.class?.name || "Session"}
                              </h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground font-medium">
                              {session.coach_name && (
                                <span className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-foreground">
                                      {session.coach_name.charAt(0)}
                                    </span>
                                  </div>
                                  {session.coach_name}
                                </span>
                              )}
                              {!session.class?.is_free_with_subscription &&
                                session.class?.price && (
                                  <span className="flex items-center gap-1.5">
                                    <Ticket className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    {(session.class?.price).toLocaleString()}{" "}
                                    {space?.workspace?.currency || space?.currency || "RWF"}
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="flex items-center w-full sm:w-auto sm:pl-4 mt-2 sm:mt-0">
                            {!isCompleted ? (
                              <Button
                                size="sm"
                                className="w-full sm:w-auto rounded-xl font-bold px-4 md:px-6 md:h-12"
                                onClick={() => onBookSession(session)}
                              >
                                Book
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled
                                className="w-full sm:w-auto rounded-xl font-bold px-4 md:px-6 md:h-12 opacity-50"
                              >
                                Completed
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
