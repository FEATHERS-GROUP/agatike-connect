import React, { useState, useMemo } from "react";
import { format, isSameDay, addHours, startOfDay, parse } from "date-fns";
import { Calendar, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceResourceBookings, createSpaceResourceBooking } from "@/api/space_resources";
import { toast } from "sonner";

interface ResourceBookingModalProps {
  resource: any;
  space: any;
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResourceBookingModal({ resource, space, user, isOpen, onClose, onSuccess }: ResourceBookingModalProps) {
  const [bookingDate, setBookingDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDuration, setBookingDuration] = useState(1);
  const queryClient = useQueryClient();

  // Fetch all bookings for this space to validate availability
  const { data: allBookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ["space_resource_bookings", space?.id],
    queryFn: () => getSpaceResourceBookings({ data: { space_id: space?.id } }),
    enabled: !!space?.id && isOpen,
  });

  const resourceBookings = useMemo(() => {
    return allBookings.filter((b: any) => b.resource_id === resource?.id && b.status !== "cancelled");
  }, [allBookings, resource?.id]);

  // Generate available time slots based on rules and existing bookings
  const availableTimeSlots = useMemo(() => {
    if (!resource || !bookingDate) return [];
    
    // Default operating hours if none provided
    const startHour = resource.rules?.operatingHours?.start ? parseInt(resource.rules.operatingHours.start.split(":")[0]) : 8;
    const endHour = resource.rules?.operatingHours?.end ? parseInt(resource.rules.operatingHours.end.split(":")[0]) : 18;
    
    const slots = [];
    const selectedDate = parse(bookingDate, "yyyy-MM-dd", new Date());
    
    // Create an array of hourly slots
    for (let hour = startHour; hour < endHour; hour++) {
      const slotTimeStr = `${hour.toString().padStart(2, '0')}:00`;
      const slotStartTime = addHours(startOfDay(selectedDate), hour);
      
      // If it's today, filter out past hours
      if (isSameDay(selectedDate, new Date()) && slotStartTime < new Date()) {
        continue;
      }
      
      // Check for overlapping bookings if exclusive is required
      let isAvailable = true;
      if (resource.rules?.requireExclusiveBooking !== false) {
        isAvailable = !resourceBookings.some((b: any) => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return slotStartTime >= bStart && slotStartTime < bEnd;
        });
      }
      
      if (isAvailable) {
        slots.push(slotTimeStr);
      }
    }
    
    return slots;
  }, [resource, bookingDate, resourceBookings]);

  // Ensure selected time is valid, else reset
  React.useEffect(() => {
    if (availableTimeSlots.length > 0 && (!bookingTime || !availableTimeSlots.includes(bookingTime))) {
      setBookingTime(availableTimeSlots[0]);
    } else if (availableTimeSlots.length === 0) {
      setBookingTime("");
    }
  }, [availableTimeSlots, bookingTime]);

  const bookMutation = useMutation({
    mutationFn: createSpaceResourceBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_resource_bookings", space?.id] });
      toast.success("Resource booked successfully!");
      onSuccess();
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to book resource.");
    }
  });

  const handleBook = () => {
    if (!bookingDate || !bookingTime || !bookingDuration || !resource) return;
    
    const startDateTime = parse(`${bookingDate} ${bookingTime}`, "yyyy-MM-dd HH:mm", new Date());
    const endDateTime = addHours(startDateTime, bookingDuration);
    
    // Final validation check to ensure the entire duration is available
    if (resource.rules?.requireExclusiveBooking !== false) {
      const isOverlap = resourceBookings.some((b: any) => {
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        return (startDateTime < bEnd && endDateTime > bStart);
      });
      
      if (isOverlap) {
        toast.error("The selected duration overlaps with an existing booking. Please reduce duration or pick another time.");
        return;
      }
    }

    bookMutation.mutate({
      data: {
        object: {
          resource_id: resource.id,
          customer_id: user?.id,
          title: `${resource.name} Booking`,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: "confirmed"
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-border/40 shadow-2xl">
        <div className="p-6 bg-secondary/5 border-b border-border/40">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Book {resource?.name}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Select a date, time, and duration for your reservation.
          </DialogDescription>
        </div>
        
        <div className="p-6 grid gap-6">
          <div className="space-y-3">
            <Label htmlFor="date" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Date</Label>
            <Input
              id="date"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
              className="h-12 rounded-xl border-border/60 bg-secondary/10 focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="time" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Start Time</Label>
              {isLoadingBookings ? (
                <div className="h-12 flex items-center justify-center rounded-xl border border-border/60 bg-secondary/10">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <select
                  id="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-border/60 bg-secondary/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {availableTimeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              ) : (
                <div className="h-12 flex items-center px-3 rounded-xl border border-border/60 bg-secondary/10 text-sm text-red-500 font-medium">
                  Fully Booked
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Duration (Hrs)</Label>
              <select
                id="duration"
                value={bookingDuration}
                onChange={(e) => setBookingDuration(Number(e.target.value))}
                className="flex h-12 w-full rounded-xl border border-border/60 bg-secondary/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                disabled={!bookingTime}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                  <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          
          {(!bookingTime && !isLoadingBookings) && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">There are no available time slots for this date. Please select another date.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-4 bg-secondary/5 border-t border-border/40">
          <Button variant="outline" className="h-11 rounded-xl px-6 font-bold" onClick={onClose}>Cancel</Button>
          <Button 
            className="h-11 rounded-xl px-8 font-bold" 
            onClick={handleBook}
            disabled={!bookingTime || bookMutation.isPending}
          >
            {bookMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
