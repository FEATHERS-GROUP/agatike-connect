export interface BusSeat {
  id: string;
  number: string;
  isBooked: boolean;
  isVip?: boolean;
}

export interface BusLayout {
  rows: number;
  columns: number; // For 2x2 this is 4, for 2x3 this is 5
  pattern: ("seat" | "aisle")[]; // e.g., ["seat", "seat", "aisle", "seat", "seat"]
  seats: BusSeat[];
}

export interface BusTrip {
  id: string;
  agency: string;
  agencyLogo: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  price: number;
  currency: string;
  busType: string;
  layout: BusLayout;
}

const agencies = [
  { name: "CTM", logo: "https://ui-avatars.com/api/?name=CTM&background=e11d48&color=fff" },
  { name: "Supratours", logo: "https://ui-avatars.com/api/?name=ST&background=7c3aed&color=fff" },
  { name: "Selam Bus", logo: "https://ui-avatars.com/api/?name=SB&background=0369a1&color=fff" },
  { name: "Skybus", logo: "https://ui-avatars.com/api/?name=SKY&background=15803d&color=fff" },
  { name: "Intercape", logo: "https://ui-avatars.com/api/?name=IC&background=b45309&color=fff" },
  { name: "FlixBus MA", logo: "https://ui-avatars.com/api/?name=FB&background=4f46e5&color=fff" },
];

function generateSeats(
  rows: number,
  columns: number,
  pattern: ("seat" | "aisle")[],
  bookedIndices: number[],
  vipIndices: number[] = [],
): BusSeat[] {
  const seats: BusSeat[] = [];
  let seatCounter = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < pattern.length; c++) {
      if (pattern[c] === "seat") {
        const isBooked = bookedIndices.includes(seatCounter);
        const isVip = vipIndices.includes(seatCounter);
        seats.push({
          id: `s-${r}-${c}`,
          number: seatCounter.toString(),
          isBooked,
          isVip,
        });
        seatCounter++;
      }
    }
  }
  return seats;
}

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export const mockBusTrips: BusTrip[] = [
  // Morocco — Casablanca → Marrakech
  {
    id: "trip-1",
    agency: "CTM",
    agencyLogo: agencies[0].logo,
    origin: "Casablanca, Morocco",
    destination: "Marrakech, Morocco",
    departureTime: "07:00",
    arrivalTime: "10:30",
    date: today,
    price: 110,
    currency: "MAD",
    busType: "VIP Coach",
    layout: {
      rows: 10,
      columns: 4,
      pattern: ["seat", "seat", "aisle", "seat", "seat"],
      seats: generateSeats(10, 4, ["seat", "seat", "aisle", "seat", "seat"], [2, 5, 8, 15, 16], [1, 2, 3, 4]),
    },
  },
  // Morocco — Rabat → Fès
  {
    id: "trip-2",
    agency: "Supratours",
    agencyLogo: agencies[1].logo,
    origin: "Rabat, Morocco",
    destination: "Fès, Morocco",
    departureTime: "09:30",
    arrivalTime: "13:00",
    date: today,
    price: 80,
    currency: "MAD",
    busType: "Standard Coach",
    layout: {
      rows: 12,
      columns: 5,
      pattern: ["seat", "seat", "aisle", "seat", "seat", "seat"],
      seats: generateSeats(12, 5, ["seat", "seat", "aisle", "seat", "seat", "seat"], [10, 11, 12, 20, 21]),
    },
  },
  // Morocco — Marrakech → Agadir (inside Morocco)
  {
    id: "trip-3",
    agency: "FlixBus MA",
    agencyLogo: agencies[5].logo,
    origin: "Marrakech, Morocco",
    destination: "Agadir, Morocco",
    departureTime: "14:00",
    arrivalTime: "17:30",
    date: today,
    price: 65,
    currency: "MAD",
    busType: "Executive",
    layout: {
      rows: 10,
      columns: 4,
      pattern: ["seat", "aisle", "seat", "seat"],
      seats: generateSeats(10, 4, ["seat", "aisle", "seat", "seat"], [3, 7, 12]),
    },
  },
  // Ethiopia — Addis Ababa → Dire Dawa
  {
    id: "trip-4",
    agency: "Selam Bus",
    agencyLogo: agencies[2].logo,
    origin: "Addis Ababa, Ethiopia",
    destination: "Dire Dawa, Ethiopia",
    departureTime: "06:00",
    arrivalTime: "15:00",
    date: today,
    price: 350,
    currency: "ETB",
    busType: "VIP Coach",
    layout: {
      rows: 14,
      columns: 5,
      pattern: ["seat", "seat", "aisle", "seat", "seat", "seat"],
      seats: generateSeats(14, 5, ["seat", "seat", "aisle", "seat", "seat", "seat"], [1, 2, 5, 6]),
    },
  },
  // Ethiopia — Addis Ababa → Hawassa
  {
    id: "trip-5",
    agency: "Selam Bus",
    agencyLogo: agencies[2].logo,
    origin: "Addis Ababa, Ethiopia",
    destination: "Hawassa, Ethiopia",
    departureTime: "08:00",
    arrivalTime: "13:00",
    date: tomorrow,
    price: 220,
    currency: "ETB",
    busType: "Standard Coach",
    layout: {
      rows: 12,
      columns: 4,
      pattern: ["seat", "seat", "aisle", "seat", "seat"],
      seats: generateSeats(12, 4, ["seat", "seat", "aisle", "seat", "seat"], [10, 11, 22, 23]),
    },
  },
  // Kenya — Nairobi → Mombasa
  {
    id: "trip-6",
    agency: "Skybus",
    agencyLogo: agencies[3].logo,
    origin: "Nairobi, Kenya",
    destination: "Mombasa, Kenya",
    departureTime: "08:00",
    arrivalTime: "17:00",
    date: today,
    price: 1500,
    currency: "KES",
    busType: "Executive",
    layout: {
      rows: 11,
      columns: 4,
      pattern: ["seat", "seat", "aisle", "seat", "seat"],
      seats: generateSeats(11, 4, ["seat", "seat", "aisle", "seat", "seat"], [1, 4, 8, 30, 31, 40]),
    },
  },
  // South Africa — Cape Town → Johannesburg
  {
    id: "trip-7",
    agency: "Intercape",
    agencyLogo: agencies[4].logo,
    origin: "Cape Town, South Africa",
    destination: "Johannesburg, South Africa",
    departureTime: "16:00",
    arrivalTime: "08:00",
    date: tomorrow,
    price: 450,
    currency: "ZAR",
    busType: "VIP Coach",
    layout: {
      rows: 13,
      columns: 4,
      pattern: ["seat", "seat", "aisle", "seat", "seat"],
      seats: generateSeats(13, 4, ["seat", "seat", "aisle", "seat", "seat"], [5, 6, 20, 21, 50]),
    },
  },
  // South Africa — Johannesburg → Durban
  {
    id: "trip-8",
    agency: "Intercape",
    agencyLogo: agencies[4].logo,
    origin: "Johannesburg, South Africa",
    destination: "Durban, South Africa",
    departureTime: "21:00",
    arrivalTime: "07:00",
    date: today,
    price: 280,
    currency: "ZAR",
    busType: "Standard Coach",
    layout: {
      rows: 12,
      columns: 4,
      pattern: ["seat", "seat", "aisle", "seat", "seat"],
      seats: generateSeats(12, 4, ["seat", "seat", "aisle", "seat", "seat"], [3, 4, 9, 16]),
    },
  },
];

