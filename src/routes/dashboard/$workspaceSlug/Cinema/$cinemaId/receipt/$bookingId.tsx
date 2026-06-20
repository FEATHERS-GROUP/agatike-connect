import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCinemaBookingById } from "@/api/cinema_bookings";
import { getCinemaById } from "@/api/cinemas";
import { useEffect } from "react";
import { Loader2, ArrowLeft, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/receipt/$bookingId")({
  component: BookingReceipt,
});

function BookingReceipt() {
  const { workspaceSlug, cinemaId, bookingId } = Route.useParams() as any;
  const navigate = useNavigate();

  const { data: booking, isLoading: loadingBooking } = useQuery({
    queryKey: ["cinema_booking", bookingId],
    queryFn: () => getCinemaBookingById({ data: { id: bookingId } }),
    enabled: !!bookingId,
  });

  const { data: cinema, isLoading: loadingCinema } = useQuery({
    queryKey: ["cinema", cinemaId],
    queryFn: () => getCinemaById({ data: { id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const isLoading = loadingBooking || loadingCinema;

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (booking && cinema) {
      // Auto-trigger print dialog after a short delay to ensure rendering
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [booking, cinema]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking || !cinema) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Receipt not found.</p>
      </div>
    );
  }

  const { schedule, ticket_tier } = booking;
  const unitPrice = booking.total_price / booking.quantity;

  return (
    <div className="min-h-screen bg-secondary/30 pb-20 print:min-h-0 print:bg-white print:pb-0 print:m-0">
      {/* Non-printable controls */}
      <div className="p-4 flex items-center justify-between max-w-sm mx-auto print:hidden">
        <Button 
          variant="outline" 
          onClick={() => navigate({ to: `/dashboard/$workspaceSlug/Cinema/$cinemaId/bookings`, params: { workspaceSlug, cinemaId } })}
          className="rounded-full h-10 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={handlePrint}
          className="rounded-full h-10 px-4 bg-primary text-primary-foreground"
        >
          <Printer className="h-4 w-4 mr-2" /> Print Receipt
        </Button>
      </div>

      {/* Printable Receipt Area */}
      {/* Optimized for 80mm thermal printers (approx 300px width) but expands to A4 width gracefully */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:block print:space-y-0 max-w-6xl mx-auto px-4 pb-12 print:px-0 print:pb-0">
        {Array.from({ length: booking.quantity }).map((_, index) => (
          <div key={index} className={`w-full max-w-[320px] mx-auto bg-white text-black p-6 shadow-sm border border-border/40 print:shadow-none print:border-none print:max-w-none print:w-full print:p-0 print:m-0 print:break-inside-avoid ${index < booking.quantity - 1 ? 'print:break-after-page' : ''}`}>
            
            {/* Header */}
        <div className="text-center border-b border-black/20 pb-4 mb-4 space-y-1">
          {cinema.logo_url && (
            <img src={cinema.logo_url} alt="Logo" className="h-12 object-contain mx-auto mb-2 grayscale" />
          )}
          <h1 className="font-black text-xl uppercase tracking-wider">{cinema.name}</h1>
          <p className="text-xs font-medium text-black/60">{cinema.city}, {cinema.address}</p>
        </div>

        {/* Booking Meta */}
        <div className="text-center space-y-0.5 mb-6">
          <p className="text-[10px] uppercase font-bold text-black/60 tracking-widest">Receipt</p>
          <p className="font-mono text-sm font-bold">{booking.qrcode_number}</p>
          <p className="text-[11px] text-black/60">{new Date(booking.created_at).toLocaleString()}</p>
        </div>

        {/* Movie Info */}
        <div className="mb-6 space-y-2">
          <p className="font-black text-lg leading-tight uppercase">{schedule.movie.title}</p>
          <div className="flex justify-between text-sm font-medium">
            <span>Date:</span>
            <span>{new Date(schedule.show_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Time:</span>
            <span>{schedule.start_time.slice(0, 5)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Screen:</span>
            <span>{schedule.screen?.name || "Standard"}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black/30 my-4"></div>

        {/* Line Items */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold">1x {ticket_tier?.name || "Ticket"} (Ticket {index + 1} of {booking.quantity})</span>
            <span className="font-medium">{formatCurrency(unitPrice, booking.currency)}</span>
          </div>
          <div className="text-xs text-black/60">
            {booking.names && <p>Customer: {booking.names}</p>}
          </div>
        </div>

        <div className="border-t border-black/20 my-4"></div>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold uppercase tracking-wider text-black/60">Total</span>
            <span className="text-xl font-black">{formatCurrency(booking.total_price, booking.currency)}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-black/60 pt-1">
            <span>Payment Method:</span>
            <span className="uppercase">{booking.payment_method}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black/30 my-6"></div>

        {/* Footer */}
        <div className="text-center text-xs space-y-1 font-medium text-black/60">
          <p>Thank you for choosing {cinema.name}!</p>
          <p>Enjoy the movie 🍿</p>
          <p className="mt-4 text-[9px]">Powered by Agatike Connect</p>
        </div>
          </div>
        ))}
      </div>
    </div>
  );
}
