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
  { name: "Virunga", logo: "https://ui-avatars.com/api/?name=Virunga&background=random" },
  { name: "Trinity", logo: "https://ui-avatars.com/api/?name=Trinity&background=random" },
  { name: "Juggle", logo: "https://ui-avatars.com/api/?name=Juggle&background=random" },
  { name: "Volcano", logo: "https://ui-avatars.com/api/?name=Volcano&background=random" },
];

function generateSeats(rows: number, columns: number, pattern: ("seat" | "aisle")[], bookedIndices: number[], vipIndices: number[] = []): BusSeat[] {
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
      } else {
        // null or undefined to represent aisle in UI, but here we just skip seat creation or we could add an aisle object.
        // Actually, we can keep the array flat and handle rendering by pattern.
      }
    }
  }
  return seats;
}

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const mockBusTrips: BusTrip[] = [
  {
    id: "trip-1",
    agency: "Virunga",
    agencyLogo: agencies[0].logo,
    origin: "Kigali, Rwanda",
    destination: "Kampala, Uganda",
    departureTime: "06:00",
    arrivalTime: "15:00",
    date: today,
    price: 15000,
    currency: "RWF",
    busType: "VIP Coach",
    layout: {
      rows: 10,
      columns: 4,
      pattern: ["seat", "seat", "aisle", "seat", "seat"],
      seats: generateSeats(10, 4, ["seat", "seat", "aisle", "seat", "seat"], [2, 5, 8, 9, 10, 30, 35, 36], [1, 2, 3, 4]),
    },
  },
  {
    id: "trip-2",
    agency: "Trinity",
    agencyLogo: agencies[1].logo,
    origin: "Kigali, Rwanda",
    destination: "Nairobi, Kenya",
    departureTime: "18:00",
    arrivalTime: "08:00",
    date: today,
    price: 45000,
    currency: "RWF",
    busType: "Standard Coach",
    layout: {
      rows: 12,
      columns: 5,
      pattern: ["seat", "seat", "aisle", "seat", "seat", "seat"],
      seats: generateSeats(12, 5, ["seat", "seat", "aisle", "seat", "seat", "seat"], [10, 11, 12, 13, 14, 15, 20, 21]),
    },
  },
  {
    id: "trip-3",
    agency: "Juggle",
    agencyLogo: agencies[2].logo,
    origin: "Kampala, Uganda",
    destination: "Kigali, Rwanda",
    departureTime: "07:30",
    arrivalTime: "16:30",
    date: today,
    price: 40000,
    currency: "UGX",
    busType: "Executive",
    layout: {
      rows: 10,
      columns: 3,
      pattern: ["seat", "aisle", "seat", "seat"],
      seats: generateSeats(10, 3, ["seat", "aisle", "seat", "seat"], Array.from({length: 30}, (_, i) => i + 1)), // Fully booked
    },
  },
  {
    id: "trip-4",
    agency: "Volcano",
    agencyLogo: agencies[3].logo,
    origin: "Nairobi, Kenya",
    destination: "Dar es Salaam, Tanzania",
    departureTime: "09:00",
    arrivalTime: "21:00",
    date: tomorrow,
    price: 3500,
    currency: "KES",
    busType: "Standard Coach",
    layout: {
      rows: 14,
      columns: 5,
      pattern: ["seat", "seat", "aisle", "seat", "seat", "seat"],
      seats: generateSeats(14, 5, ["seat", "seat", "aisle", "seat", "seat", "seat"], [1, 2, 3, 50, 51]),
    },
  },
  {
    id: "trip-5",
    agency: "Trinity",
    agencyLogo: agencies[1].logo,
    origin: "Dar es Salaam, Tanzania",
    destination: "Kigali, Rwanda",
    departureTime: "05:00",
    arrivalTime: "22:00",
    date: tomorrow,
    price: 80000,
    currency: "TZS",
    busType: "VIP Coach",
    layout: {
      rows: 9,
      columns: 4,
      pattern: ["seat", "seat", "aisle", "seat", "seat"],
      seats: generateSeats(9, 4, ["seat", "seat", "aisle", "seat", "seat"], [5, 6]),
    },
  }
];
