import { MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";
import { COUNTRIES } from "@/lib/countries";

interface BookingFormProps {
  attendees: any[];
  assignMode: "me" | "others";
  setAssignMode: (mode: "me" | "others") => void;
  updateAttendee: (index: number, field: string, value: string) => void;
  updateDynamicField: (index: number, fieldId: string, value: string) => void;
  getTierDetails: (tierId: string) => any;
  getStopDetails: (stopIdx: number) => any;
  stopsWithVenues: any[];
  vipPrivileges: any[];
  formatSeatDisplay: (raw: any, sectionName?: string) => string;
}

export function BookingForm({
  attendees,
  assignMode,
  setAssignMode,
  updateAttendee,
  updateDynamicField,
  getTierDetails,
  getStopDetails,
  stopsWithVenues,
  vipPrivileges,
  formatSeatDisplay,
}: BookingFormProps) {
  const totalTickets = attendees.length;

  const countrySelectItems = useMemo(() => {
    return COUNTRIES.map((c) => (
      <SelectItem key={c.name} value={c.name}>
        {c.name}
      </SelectItem>
    ));
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-6">Checkout ({totalTickets} Tickets)</h1>

        {totalTickets > 1 && (
          <div className="flex bg-muted/50 p-1 rounded-xl mb-6 w-fit">
            <button
              onClick={() => setAssignMode("me")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                assignMode === "me"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Assign to Me (Faster)
            </button>
            <button
              onClick={() => setAssignMode("others")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                assignMode === "others"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Assign Individually
            </button>
          </div>
        )}

        <div className="space-y-8">
          {(assignMode === "me" ? [attendees[0]] : attendees).map((attendee, idx) => {
            if (!attendee) return null;
            const tier = getTierDetails(attendee.tierId);
            const stop = getStopDetails(attendee.stopIdx);

            const projectForStop = stopsWithVenues.find(
              (s) => s.stopIdx === attendee.stopIdx
            )?.project;
            const isSeatRequired = projectForStop?.sections_data?.some(
              (s: any) => s.ticketId === attendee.tierId
            );

            const tierPrivileges = tier?.vip_privilege_ids
              ?.map((pid: string) => vipPrivileges.find((vp: any) => vp.id === pid))
              .filter(Boolean) || [];
            const dynamicFields = tierPrivileges.flatMap((p: any) => p.fields || []);

            const seatsList = assignMode === "me"
              ? attendees
                  .filter((a) => a.tierId === attendee.tierId && a.stopIdx === attendee.stopIdx)
                  .map((a) => formatSeatDisplay(a.seatName || a.seat, a.sectionName))
                  .filter(Boolean)
              : [formatSeatDisplay(attendee.seatName || attendee.seat, attendee.sectionName)].filter(Boolean);

            return (
              <div key={idx} className="p-6 rounded-3xl border border-border/60 bg-card/40 space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">
                        {assignMode === "me"
                          ? "Your Details (Applied to all tickets)"
                          : tier
                          ? tier.type
                          : "Ticket"}
                      </h3>
                      {assignMode === "others" && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <MapPin className="h-3 w-3" /> {stop.city} &middot;{" "}
                          <Calendar className="h-3 w-3" /> {stop.date}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSeatRequired && seatsList.length > 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        Assigned Seat{seatsList.length > 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {seatsList.map((sName, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-bold"
                          >
                            {sName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={attendee.firstName || ""}
                      onChange={(e) => updateAttendee(idx, "firstName", e.target.value)}
                      placeholder="Alex"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={attendee.lastName || ""}
                      onChange={(e) => updateAttendee(idx, "lastName", e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={attendee.email || ""}
                    onChange={(e) => updateAttendee(idx, "email", e.target.value)}
                    placeholder="alex@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={attendee.phone || ""}
                      onChange={(e) => updateAttendee(idx, "phone", e.target.value)}
                      placeholder="+250 788 123 456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={attendee.country}
                      onValueChange={(val) => updateAttendee(idx, "country", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>{countrySelectItems}</SelectContent>
                    </Select>
                  </div>
                </div>

                {dynamicFields.length > 0 && (
                  <div className="pt-4 border-t border-border/60">
                    <h4 className="text-sm font-semibold mb-4 text-primary flex items-center gap-2">
                      Ticket Privileges Required Info
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {dynamicFields.map((field: any) => (
                        <div key={field.id} className="space-y-2">
                          <Label>
                            {field.name} {field.required && <span className="text-red-500">*</span>}
                          </Label>
                          {field.type === "text" || field.type === "license_plate" ? (
                            <Input
                              value={attendee.dynamic_fields?.[field.id] || ""}
                              onChange={(e) => updateDynamicField(idx, field.id, e.target.value)}
                              placeholder={field.type === "license_plate" ? "e.g. RAA 123 A" : ""}
                              required={field.required}
                            />
                          ) : field.type === "boolean" ? (
                            <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                              <input
                                type="checkbox"
                                id={`${idx}-${field.id}`}
                                checked={attendee.dynamic_fields?.[field.id] === "true"}
                                onChange={(e) =>
                                  updateDynamicField(idx, field.id, e.target.checked ? "true" : "")
                                }
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor={`${idx}-${field.id}`} className="text-sm text-foreground cursor-pointer">
                                Yes
                              </label>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
