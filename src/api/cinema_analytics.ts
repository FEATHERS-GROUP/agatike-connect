import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const GET_WORKSPACE_CINEMA_ANALYTICS = `
  query GetWorkspaceCinemaAnalytics($workspace_id: uuid!) {
    cinemas(where: { workspace_id: { _eq: $workspace_id } }) {
      id
      name
      city
      movies_aggregate {
        aggregate { count }
      }
      schedules {
        booked_seats
        screen { capacity }
      }
    }
    cinema_bookings(
      where: { 
        cinema: { workspace_id: { _eq: $workspace_id } },
        status: { _eq: "Confirmed" }
      },
      order_by: { created_at: asc }
    ) {
      id
      cinema_id
      total_price
      quantity
      created_at
      schedule {
        movie {
          id
          title
        }
      }
    }
  }
`;

export const getWorkspaceCinemaAnalytics = createServerFn({ method: "POST" })
  .validator((d: { workspace_id: string }) => d)
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data;
    if (!workspace_id) throw new Error("workspace_id is required");

    const res = await hasuraRequest<any>(GET_WORKSPACE_CINEMA_ANALYTICS, { workspace_id });
    
    const cinemas = res.cinemas || [];
    const bookings = res.cinema_bookings || [];

    // Process Cinema Stats
    const cinemaStats = cinemas.map((c: any) => {
      // Calculate attendance rate
      let totalCapacity = 0;
      let totalBooked = 0;
      (c.schedules || []).forEach((sch: any) => {
        totalCapacity += sch.screen?.capacity || 0;
        totalBooked += sch.booked_seats || 0;
      });
      const attendance_rate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

      // Filter bookings for this cinema
      const cBookings = bookings.filter((b: any) => b.cinema_id === c.id);
      const revenue = cBookings.reduce((sum: number, b: any) => sum + parseFloat(b.total_price || "0"), 0);
      const tickets = cBookings.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const lastMonth = lastMonthDate.getMonth();
      const lastMonthYear = lastMonthDate.getFullYear();

      let currentMonthRev = 0;
      let lastMonthRev = 0;

      cBookings.forEach((b: any) => {
        if (!b.created_at) return;
        const bDate = new Date(b.created_at);
        const bMonth = bDate.getMonth();
        const bYear = bDate.getFullYear();
        const val = parseFloat(b.total_price || "0");
        
        if (bMonth === currentMonth && bYear === currentYear) {
          currentMonthRev += val;
        } else if (bMonth === lastMonth && bYear === lastMonthYear) {
          lastMonthRev += val;
        }
      });

      let trend = 0;
      if (lastMonthRev > 0) {
        trend = Math.round(((currentMonthRev - lastMonthRev) / lastMonthRev) * 100);
      } else if (currentMonthRev > 0) {
        trend = 100;
      }

      return {
        id: c.id,
        name: c.name,
        city: c.city,
        revenue,
        tickets,
        attendance_rate,
        movies_showing: c.movies_aggregate?.aggregate?.count || 0,
        trend,
      };
    });

    // Process Monthly Data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = new Map<string, { month: string, revenue: number, tickets: number }>();
    
    // Initialize last 6 months to ensure chart looks good
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const d2 = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mName = monthNames[d2.getMonth()];
      const year = d2.getFullYear();
      const key = `${year}-${d2.getMonth()}`;
      monthlyMap.set(key, { month: mName, revenue: 0, tickets: 0 });
    }

    bookings.forEach((b: any) => {
      if (!b.created_at) return;
      const bDate = new Date(b.created_at);
      const key = `${bDate.getFullYear()}-${bDate.getMonth()}`;
      // If booking is from older than 6 months, we might still include it if we want all time, 
      // but let's just group it. We'll map it to month Name.
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { month: monthNames[bDate.getMonth()], revenue: 0, tickets: 0 });
      }
      const m = monthlyMap.get(key)!;
      m.revenue += parseFloat(b.total_price || "0");
      m.tickets += b.quantity || 0;
    });

    // Convert map to array and sort by chronological order if needed, or just keep insertion order
    // To keep it simple, we'll just take the last 6 entries or all entries sorted by Date
    const monthlyData = Array.from(monthlyMap.entries())
      .sort((a, b) => {
        const [yA, mA] = a[0].split("-").map(Number);
        const [yB, mB] = b[0].split("-").map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      })
      .slice(-6) // Keep last 6 months for the chart
      .map(entry => entry[1]);

    // Process Top Movies
    const movieStats = new Map<string, { title: string, cinema: string, tickets: number, revenue: number }>();
    
    bookings.forEach((b: any) => {
      const movieTitle = b.schedule?.movie?.title || "Unknown Movie";
      const cinemaName = cinemas.find((c: any) => c.id === b.cinema_id)?.name || "Unknown Cinema";
      const key = `${movieTitle}-${cinemaName}`;
      
      if (!movieStats.has(key)) {
        movieStats.set(key, { title: movieTitle, cinema: cinemaName, tickets: 0, revenue: 0 });
      }
      
      const stat = movieStats.get(key)!;
      stat.tickets += b.quantity || 0;
      stat.revenue += parseFloat(b.total_price || "0");
    });

    const topMovies = Array.from(movieStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5

    return {
      cinemaStats,
      monthlyData,
      topMovies
    };
  });
